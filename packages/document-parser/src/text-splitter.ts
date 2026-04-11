import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

export interface TextChunk {
    content: string;
    chunkIndex: number;
    tokenCount: number;
    metadata?: Record<string, any>;
}

export interface SplitOptions {
    chunkSize?: number;
    chunkOverlap?: number;
    separators?: string[];
}

const DEFAULT_OPTIONS: SplitOptions = {
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ['\n\n', '\n', '. ', ' ', ''],
};

export async function splitText(text: string, options: SplitOptions = {}): Promise<TextChunk[]> {
    const {
        chunkSize = DEFAULT_OPTIONS.chunkSize,
        chunkOverlap = DEFAULT_OPTIONS.chunkOverlap,
        separators = DEFAULT_OPTIONS.separators,
    } = options;

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap,
        separators,
    });

    const chunks = await splitter.splitText(text);

    return chunks.map((content: string, index: number) => ({
        content,
        chunkIndex: index,
        tokenCount: estimateTokenCount(content),
    }));
}

function estimateTokenCount(text: string): number {
    // Rough estimation: ~4 characters per token for English
    return Math.ceil(text.length / 4);
}
