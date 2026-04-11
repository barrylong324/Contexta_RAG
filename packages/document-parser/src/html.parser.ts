import * as cheerio from 'cheerio';

export function parseHtml(html: string): string {
    try {
        const $ = cheerio.load(html);

        // Remove script and style elements
        $('script').remove();
        $('style').remove();

        // Extract text content
        const text = $('body').text();

        // Clean up whitespace
        return text.replace(/\s+/g, ' ').trim();
    } catch (error) {
        throw new Error(
            `Failed to parse HTML: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
    }
}
