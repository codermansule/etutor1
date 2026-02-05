import { createServerClient } from '@/lib/supabase/server';
import { generateEmbedding, chunkText } from './embeddings';

interface IngestOptions {
    title: string;
    content: string;
    subjectId: string;
    metadata?: any;
    sourceUrl?: string;
}

/**
 * Knowledge Base Ingestion Service.
 * Splits text into chunks, generates embeddings, and stores them in the vector database.
 */
export async function ingestDocument({
    title,
    content,
    subjectId,
    metadata = {},
    sourceUrl
}: IngestOptions) {
    const supabase = await createServerClient();

    // 1. Chunk the text
    const chunks = chunkText(content, 800); // Larger chunks for better context retention

    console.log(`Ingesting document: ${title} (${chunks.length} chunks)`);

    const ingestionResults = [];

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        try {
            // 2. Generate embedding for each chunk
            const embedding = await generateEmbedding(chunk);

            // 3. Store in database
            const { data, error } = await supabase
                .from('knowledge_documents')
                .insert({
                    title,
                    content: chunk,
                    subject_id: subjectId,
                    embedding,
                    chunk_index: i,
                    metadata: {
                        ...metadata,
                        total_chunks: chunks.length,
                    },
                    source_url: sourceUrl
                })
                .select()
                .single();

            if (error) throw error;
            ingestionResults.push(data.id);
        } catch (error) {
            console.error(`Failed to ingest chunk ${i} of ${title}:`, error);
        }
    }

    return {
        success: ingestionResults.length === chunks.length,
        totalChunks: chunks.length,
        ingestedChunks: ingestionResults.length
    };
}

/**
 * Deletes all knowledge documents for a specific subject (for re-indexing).
 */
export async function clearKnowledgeBase(subjectId: string) {
    const supabase = await createServerClient();
    const { error } = await supabase
        .from('knowledge_documents')
        .delete()
        .eq('subject_id', subjectId);

    return !error;
}
