import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../database/prisma.service';
import { Document } from '@rag-ai/database';

@Injectable()
export class DocumentsService {
    constructor(
        private prisma: PrismaService,
        @InjectQueue('document-processing') private documentQueue: Queue,
    ) {}

    async findByKnowledgeBase(kbId: string, userId: string): Promise<Document[]> {
        // Verify access to knowledge base
        const kb = await this.prisma.knowledgeBase.findFirst({
            where: {
                id: kbId,
                OR: [{ ownerId: userId }, { collaborations: { some: { userId } } }],
            },
        });

        if (!kb) {
            throw new NotFoundException('Knowledge base not found or access denied');
        }

        return this.prisma.document.findMany({
            where: {
                knowledgeBaseId: kbId,
                deletedAt: null,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string, userId: string): Promise<Document> {
        const doc = await this.prisma.document.findFirst({
            where: {
                id,
                deletedAt: null,
                knowledgeBase: {
                    OR: [{ ownerId: userId }, { collaborations: { some: { userId } } }],
                },
            },
        });

        if (!doc) {
            throw new NotFoundException('Document not found or access denied');
        }

        return doc;
    }

    async create(data: {
        title: string;
        fileName: string;
        fileType: string;
        fileSize: number;
        mimeType: string;
        storageKey: string;
        knowledgeBaseId: string;
        uploadedById: string;
        tags?: string[];
    }): Promise<Document> {
        const document = await this.prisma.document.create({
            data: {
                title: data.title,
                fileName: data.fileName,
                fileType: data.fileType,
                fileSize: data.fileSize,
                mimeType: data.mimeType,
                storageKey: data.storageKey,
                knowledgeBaseId: data.knowledgeBaseId,
                uploadedById: data.uploadedById,
                tags: data.tags || [],
                status: 'PENDING',
            },
        });

        // Add to processing queue
        await this.documentQueue.add('process-document', {
            documentId: document.id,
        });

        return document;
    }

    async delete(id: string, userId: string): Promise<void> {
        const doc = await this.findById(id, userId);

        await this.prisma.document.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }

    async updateStatus(documentId: string, status: string, error?: string) {
        await this.prisma.document.update({
            where: { id: documentId },
            data: {
                status: status as any,
                processingError: error,
            },
        });
    }
}
