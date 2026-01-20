-- 修复 words 表 - 添加缺失的音标字段
-- 在 Zeabur PostgreSQL 控制台执行

-- 添加音标字段
ALTER TABLE words ADD COLUMN IF NOT EXISTS phonetic_us VARCHAR(50);
ALTER TABLE words ADD COLUMN IF NOT EXISTS phonetic_uk VARCHAR(50);

-- 添加注释
COMMENT ON COLUMN words.phonetic_us IS '美式音标';
COMMENT ON COLUMN words.phonetic_uk IS '英式音标';

-- 验证字段已添加
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'words'
ORDER BY ordinal_position;
