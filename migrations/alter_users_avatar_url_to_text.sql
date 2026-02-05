-- Migration: Change users.avatar_url from VARCHAR(512) to TEXT
-- Date: 2026-02-05
-- Reason: Support storing base64 encoded images (which are much larger than 512 characters)

-- PostgreSQL
ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT;

-- Verify the change
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'avatar_url';

-- Expected result:
-- column_name  | data_type | character_maximum_length
-- -------------|-----------|-------------------------
-- avatar_url   | text      | <NULL>
