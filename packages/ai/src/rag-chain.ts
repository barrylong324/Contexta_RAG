import { prisma } from '@rag-ai/database';
import { getEmbeddings } from './embeddings';
import { getLLM } from './llm';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { SourceReference } from '@rag-ai/shared-types';

// ============================================
// RAG Chain Implementation
// ============================================

export interface RAGContext {
    query: string;
    knowledgeBaseId?: string;
    topK?: number;
    conversationHistory?: Array<{ role: string; content: string }>;
}

export interface RAGResult {
    answer: string;
    sources: SourceReference[];
}

const SYSTEM_PROMPT = `You are a knowledgeable AI assistant for a knowledge base system. 
Your task is to answer questions based on the provided context from documents.

Guidelines:
- Answer based ONLY on the provided context
- If the context doesn't contain relevant information, say "I don't have enough information to answer this question based on the available documents."
- Cite your sources by mentioning which document the information came from
- Be concise but thorough
- Use markdown formatting for better readability
- If asked about something outside the context, politely redirect to what you can help with

Context will be provided in the following format:
[Document: Title]
Content...

[Document: Another Title]
More content...`;
export async function executeRAGChain(context: RAGContext): Promise<RAGResult> {
    const { query, knowledgeBaseId, topK = 5, conversationHistory = [] } = context;

    // Step 1: Retrieve relevant chunks
    const chunks = await retrieveRelevantChunks(query, knowledgeBaseId, topK);

    if (chunks.length === 0) {
        return {
            answer: "I couldn't find any relevant documents to answer your question.",
            sources: [],
        };
    }
    // Step 2: Build context from retrieved chunks
    const contextText = buildContextFromChunks(chunks);

    // Step 3: Build messages
    const messages = [
        new SystemMessage(SYSTEM_PROMPT),
        ...conversationHistory.map((msg) =>
            msg.role === 'user' ? new HumanMessage(msg.content) : new SystemMessage(msg.content),
        ),
        new HumanMessage(`Context:\n${contextText}\n\nQuestion: ${query}`),
    ];

    // Step 4: Call LLM
    const llm = getLLM(0.7);
    const response = await llm.invoke(messages);

    // Step 5: Format sources
    const sources: SourceReference[] = chunks.map((chunk) => ({
        chunkId: chunk.id,
        documentId: chunk.documentId,
        documentTitle: chunk.document.title,
        score: chunk.similarityScore || 0,
        content: chunk.content.substring(0, 300) + '...',
    }));

    return {
        answer: response.content as string,
        sources,
    };
}

// ============================================
// Helper Functions
// ============================================

async function retrieveRelevantChunks(query: string, knowledgeBaseId?: string, topK: number = 5) {
    const embeddings = getEmbeddings();
    const queryEmbedding = await embeddings.embedQuery(query);
    // Convert embedding array to PostgreSQL vector format
    const embeddingStr = `[${queryEmbedding.join(',')}]`;
    // Query pgvector for similar chunks
    const whereClause = knowledgeBaseId
        ? 'WHERE d."knowledgeBaseId" = $1 AND d.status = \'COMPLETED\' AND d."deletedAt" IS NULL'
        : 'WHERE d.status = \'COMPLETED\' AND d."deletedAt" IS NULL';

    const params = knowledgeBaseId ? [knowledgeBaseId, embeddingStr, topK] : [embeddingStr, topK];

    const query_text = `
    SELECT 
      dc.id,
      dc.content,
      dc."documentId",
      d.title as "documentTitle",
      dc.metadata,
      1 - (dc.embedding <=> $2::vector) as "similarityScore"
    FROM "document_chunks" dc
    JOIN documents d ON dc."documentId" = d.id
    ${whereClause}
    ORDER BY dc.embedding <=> $2::vector ASC
    LIMIT $3
  `;

    const results = await prisma.$queryRawUnsafe(query_text, ...params);
    return results as any[];
}

function buildContextFromChunks(chunks: any[]): string {
    return chunks
        .map((chunk) => {
            return `[Document: ${chunk.documentTitle}]\n${chunk.content}\n`;
        })
        .join('\n---\n\n');
}

export async function generateDocumentSummary(content: string): Promise<string> {
    const llm = getLLM(0.5);
    const prompt = `Please provide a concise summary (200-300 words) of the following document content:\n\n${content.substring(0, 3000)}`;

    const response = await llm.invoke([new HumanMessage(prompt)]);
    return response.content as string;
}
