import { openaiProvider } from './openai';
import { embed } from 'ai';

/**
 * Generates a vector embedding for a given text using OpenAI's embedding model.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const { embedding } = await embed({
        model: openaiProvider.embedding('text-embedding-3-small'),
        value: text.replace(/\n/g, ' '),
    });
    return embedding;
}

/**
 * Splits a text into smaller chunks for improved retrieval accuracy.
 */
export function chunkText(text: string, chunkSize: number = 500): string[] {
    const sentences = text.split(/[.?!]\s/);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = "";
        }
        currentChunk += sentence + ". ";
    }

    if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}
