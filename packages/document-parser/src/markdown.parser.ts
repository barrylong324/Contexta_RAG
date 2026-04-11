export function parseMarkdown(markdown: string): string {
    try {
        // For now, just return the markdown as-is
        // In production, you might want to convert to plain text or HTML
        return markdown;
    } catch (error) {
        throw new Error(
            `Failed to parse Markdown: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
    }
}
