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
