import { googleProvider } from './provider';
import { embed } from 'ai';

/**
 * Generates a vector embedding for a given text using Google's embedding model.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const { embedding } = await embed({
        model: googleProvider.textEmbeddingModel('text-embedding-004'),
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
