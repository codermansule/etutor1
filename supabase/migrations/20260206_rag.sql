-- Enable the pgvector extension to work with embeddings
create extension if not exists vector;

-- Create a table for storing document chunks and their embeddings
create table if not exists knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  metadata jsonb default '{}'::jsonb,
  embedding vector(1536), -- 1536 is the dimension for openai text-embedding-3-small
  subject_id uuid references subjects(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index the embedding column for efficient vector similarity search
create index on knowledge_documents using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Function to search for documents based on embedding similarity
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_subject_id uuid default null
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    kd.id,
    kd.content,
    kd.metadata,
    1 - (kd.embedding <=> query_embedding) as similarity
  from knowledge_documents kd
  where (filter_subject_id is null or kd.subject_id = filter_subject_id)
    and 1 - (kd.embedding <=> query_embedding) > match_threshold
  order by kd.embedding <=> query_embedding
  limit match_count;
end;
$$;
