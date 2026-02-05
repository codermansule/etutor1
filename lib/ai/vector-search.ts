import { createServerClient } from '@/lib/supabase/server';
import { generateEmbedding } from './embeddings';

export interface SearchResult {
    content: string;
    metadata: any;
    similarity: number;
}

/**
 * Searches the knowledge base for content relevant to the user query.
 */
export async function findRelevantContent(
    query: string,
    subjectId?: string,
    limit: number = 3
): Promise<string> {
    const supabase = await createServerClient();
    const embedding = await generateEmbedding(query);

    const { data: documents, error } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: limit,
        filter_subject_id: subjectId
    });

    if (error) {
        console.error('Vector Search Error:', error);
        return "";
    }

    if (!documents || documents.length === 0) {
        return "";
    }

    return documents
        .map((doc: any) => `[RELEVANT CONTEXT]\n${doc.content}\n[/RELEVANT CONTEXT]`)
        .join('\n\n');
}
