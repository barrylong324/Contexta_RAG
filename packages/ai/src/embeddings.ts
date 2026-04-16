import { OpenAIEmbeddings } from '@langchain/openai';
import { config } from '@rag-ai/config';

// ============================================
// OpenAI Embeddings Configuration
// ============================================

let embeddingsInstance: OpenAIEmbeddings | null = null;

export function getEmbeddings(): OpenAIEmbeddings {
    if (!embeddingsInstance) {
        embeddingsInstance = new OpenAIEmbeddings({
            openAIApiKey: config.OPENAI_API_KEY,
            modelName: config.OPENAI_EMBEDDING_MODEL,
            dimensions: 1536, // Ada-002 dimension
        });

        // embeddingsInstance = new OpenAIEmbeddings({
        //     // 1. API Key 换成 DeepSeek 的
        //     openAIApiKey: config.OPENAI_API_KEY,
        //     // 2. Model Name 换成 DeepSeek 的聊天模型（注意：并非专用 Embedding 模型）
        //     modelName: 'deepseek-chat',
        //     // 3. 增加 configuration 参数，指定 DeepSeek 的 Base URL
        //     configuration: {
        //         baseURL: 'https://api.deepseek.com/v1', // DeepSeek 的 OpenAI 兼容端点
        //     },
        //     // 4. Dimensions 可以删掉，因为 DeepSeek 模型本身不直接支持此参数
        // });
    }
    return embeddingsInstance;
}

export async function embedText(text: string): Promise<number[]> {
    const embeddings = getEmbeddings();
    const result = await embeddings.embedQuery(text);
    return result;
}

export async function embedDocuments(documents: string[]): Promise<number[][]> {
    const embeddings = getEmbeddings();
    const results = await embeddings.embedDocuments(documents);
    return results;
}
