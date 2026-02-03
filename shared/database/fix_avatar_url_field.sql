-- 修改 avatar_url 字段为 TEXT 类型以支持 base64 图片
ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT;

-- 验证修改
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'avatar_url';
