-- 在 zeabur 数据库中添加缺失的字段
-- 直接在 Zeabur PostgreSQL 控制台执行

-- 验证当前数据库
SELECT current_database();

-- 切换到 zeabur 数据库（如果在其他数据库）
-- 注意：可能需要在控制台选择数据库，或者直接操作

-- 添加字段
ALTER TABLE words ADD COLUMN IF NOT EXISTS phonetic_us VARCHAR(50);
ALTER TABLE words ADD COLUMN IF NOT EXISTS phonetic_uk VARCHAR(50);

-- 验证字段已添加
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'words'
AND column_name IN ('phonetic_us', 'phonetic_uk')
ORDER BY column_name;
