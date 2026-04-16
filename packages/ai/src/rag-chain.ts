import { prisma } from '@rag-ai/database';
import { getEmbeddings } from './embeddings';
import { getLLM } from './llm';
import { HumanMessage, SystemMessage, BaseMessage } from '@langchain/core/messages';
import { SourceReference } from '@rag-ai/shared-types';
import { config } from '@rag-ai/config';

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
import { ChatDeepSeek } from '@langchain/deepseek';
// 初始化 ChatDeepSeek 实例
const client = new ChatDeepSeek({
    apiKey: config.OPENAI_API_KEY, // 从环境变量读取 API Key
    model: 'deepseek-chat', // 指定 DeepSeek 的模型名称
    configuration: {
        baseURL: 'https://api.deepseek.com/v1', // DeepSeek 的 OpenAI 兼容端点
    },
    // 可选参数示例
    temperature: 0.7, // 控制回答的创造性 (范围0-2)
    maxRetries: 2, // 请求失败时的重试次数[reference:2][reference:3]
} as any);
// 封装一个异步函数来处理对话请求
export async function askDeepSeek(prompt: string) {
    try {
        // 使用 LangChain v1 的消息格式
        const messages: BaseMessage[] = [
            new SystemMessage('你需要什么帮助呢？'),
            new HumanMessage(prompt),
        ];
        // 调用模型并获取结果
        console.log(9999);
        const response = await client.invoke(messages as any);
        console.log(100000, response);
        // 返回模型生成的文本内容
        return (response as any).content;
    } catch (error) {
        console.error('调用 DeepSeek API 时发生错误:', error);
        // 可以在这里进行更精细的错误处理，比如根据不同错误类型返回不同提示
        throw new Error('无法处理您的请求，请稍后再试。');
    }
}

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
