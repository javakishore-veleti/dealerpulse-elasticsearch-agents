-- ═══════════════════════════════════════════════
-- DealerPulse — PostgreSQL Init Script
-- Runs once on first container startup.
-- ═══════════════════════════════════════════════

-- Enable pgVector extension (adds VECTOR data type + similarity operators)
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable full-text search (already built-in, but good to be explicit)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify pgVector is working
-- You can store embeddings like: embedding VECTOR(1536)
-- And query like: ORDER BY embedding <=> '[0.1, 0.2, ...]'
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
