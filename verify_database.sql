-- 验证 Word Service 连接的是哪个数据库
-- 在 Zeabur PostgreSQL 控制台执行

-- 1. 查看当前数据库
SELECT current_database();

-- 2. 查看 words 表所在的数据库和 schema
SELECT table_catalog, table_schema, table_name
FROM information_schema.tables
WHERE table_name = 'words';

-- 3. 查看 words 表的所有字段
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'words' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. 验证字段确实存在
SELECT
    column_name,
    data_type,
    CASE
        WHEN column_name IN ('phonetic_us', 'phonetic_uk') THEN '✅ NEW FIELD'
        ELSE 'EXISTING'
    END as status
FROM information_schema.columns
WHERE table_name = 'words' AND table_schema = 'public'
ORDER BY ordinal_position;
