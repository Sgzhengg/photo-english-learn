-- 修复匿名用户登录问题（PostgreSQL语法）
-- 执行此脚本来允许 password_hash 为 NULL

-- 1. 修改 password_hash 字段为允许 NULL
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- 2. 如果 is_anonymous 列不存在，添加它
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'is_anonymous'
    ) THEN
        ALTER TABLE users ADD COLUMN is_anonymous INT DEFAULT 0;
    END IF;
END
$$;

-- 3. 验证修改
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
