-- ============================================
-- 修复头像字段类型
-- ============================================

-- 检查当前字段类型
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'avatar_url';

-- 修改字段为 TEXT 类型（如果还是 VARCHAR(512)）
-- 注意：PostgreSQL 的 TEXT 类型没有长度限制
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'avatar_url' 
        AND data_type = 'character varying'
        AND character_maximum_length = 512
    ) THEN
        ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT;
        RAISE NOTICE 'avatar_url 字段已从 VARCHAR(512) 修改为 TEXT';
    ELSE
        RAISE NOTICE 'avatar_url 字段已经是 TEXT 类型或其他类型，无需修改';
    END IF;
END $$;

-- 验证修改结果
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'avatar_url';

-- 查看当前头像数据统计
SELECT 
    user_id,
    username,
    LENGTH(avatar_url) as avatar_length,
    SUBSTRING(avatar_url, 1, 50) as avatar_preview
FROM users 
WHERE avatar_url IS NOT NULL 
LIMIT 5;
