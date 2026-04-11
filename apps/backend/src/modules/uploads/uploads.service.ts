import { Injectable, BadRequestException } from '@nestjs/common';
import { DocumentsService } from '../documents/documents.service';
import { parsePdf, parseDocx, parseHtml, parseMarkdown, splitText } from '@rag-ai/document-parser';
import { getEmbeddings } from '@rag-ai/ai';
import { PrismaService } from '../../database/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class UploadsService {
    constructor(
        private documentsService: DocumentsService,
        private prisma: PrismaService,
    ) {}

    async processUploadedFile(
        file: Express.Multer.File,
        knowledgeBaseId: string,
        userId: string,
        title?: string,
        tags?: string[],
    ) {
        const originalName = file.originalname;
        const fileType = this.getFileType(originalName);
        const mimeType = file.mimetype;
        const fileSize = file.size;

        // Parse document content
        let content: string;
        try {
            content = await this.parseDocument(file.buffer, fileType);
        } catch (error) {
            throw new BadRequestException(`Failed to parse ${fileType} file: ${error.message}`);
        }

        if (!content || content.trim().length === 0) {
            throw new BadRequestException('Document appears to be empty');
        }

        // Create document record
        const document = await this.documentsService.create({
            title: title || originalName,
            fileName: originalName,
            fileType,
            fileSize,
            mimeType,
            storageKey: file.path,
            knowledgeBaseId,
            uploadedById: userId,
            tags,
        });

        return {
            documentId: document.id,
            message: 'Document uploaded and queued for processing',
        };
    }

    private getFileType(filename: string): string {
        const ext = path.extname(filename).toLowerCase();
        const typeMap: Record<string, string> = {
            '.pdf': 'PDF',
            '.docx': 'DOCX',
            '.doc': 'DOCX',
            '.txt': 'TXT',
            '.md': 'MARKDOWN',
            '.html': 'HTML',
            '.htm': 'HTML',
        };
        return typeMap[ext] || 'UNKNOWN';
    }

    private async parseDocument(buffer: Buffer, fileType: string): Promise<string> {
        switch (fileType) {
            case 'PDF':
                return await parsePdf(buffer);
            case 'DOCX':
                return await parseDocx(buffer);
            case 'HTML':
                return parseHtml(buffer.toString('utf-8'));
            case 'MARKDOWN':
                return parseMarkdown(buffer.toString('utf-8'));
            case 'TXT':
                return buffer.toString('utf-8');
            default:
                throw new Error(`Unsupported file type: ${fileType}`);
        }
    }

    async vectorizeDocument(documentId: string) {
        try {
            // Get document
            const document = await this.prisma.document.findUnique({
                where: { id: documentId },
            });

            if (!document) {
                throw new Error('Document not found');
            }

            // Read file content
            const filePath = path.resolve(document.storageKey);
            const fileBuffer = await fs.readFile(filePath);

            // Parse content
            const content = await this.parseDocument(fileBuffer, document.fileType);

            // Split into chunks
            const chunks = await splitText(content, {
                chunkSize: 1000,
                chunkOverlap: 200,
            });

            // Generate embeddings
            const embeddings = getEmbeddings();
            const texts = chunks.map((chunk) => chunk.content);
            const vectors = await embeddings.embedDocuments(texts);

            // Save chunks with embeddings using raw SQL for vector type
            for (let i = 0; i < chunks.length; i++) {
                const embeddingArray = vectors[i];
                const embeddingStr = `[${embeddingArray.join(',')}]`;

                await this.prisma.$executeRaw`
          INSERT INTO document_chunks (id, "documentId", content, embedding, "chunkIndex", "tokenCount", "createdAt")
          VALUES (
            gen_random_uuid()::text,
            ${document.id},
            ${chunks[i].content},
            ${embeddingStr}::vector,
            ${chunks[i].chunkIndex},
            ${chunks[i].tokenCount},
            NOW()
          )
        `;
            }

            // Update document status
            await this.documentsService.updateStatus(documentId, 'COMPLETED');

            console.log(
                `✅ Document ${documentId} vectorized successfully (${chunks.length} chunks)`,
            );
        } catch (error) {
            console.error(`❌ Failed to vectorize document ${documentId}:`, error);
            await this.documentsService.updateStatus(
                documentId,
                'FAILED',
                error instanceof Error ? error.message : 'Unknown error',
            );
            throw error;
        }
    }
}
