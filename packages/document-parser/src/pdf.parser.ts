import pdf from 'pdf-parse';

export async function parsePdf(buffer: Buffer): Promise<string> {
    try {
        const data = await pdf(buffer);
        return data.text;
    } catch (error) {
        throw new Error(
            `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
    }
}
