-- ============================================
-- 完整修复 review_records 表 - 添加所有缺失的列
-- 在 Zeabur PostgreSQL 控制台执行
-- ============================================

-- 1. 添加 level 列
ALTER TABLE review_records ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0;

-- 2. 添加 total_correct 列
ALTER TABLE review_records ADD COLUMN IF NOT EXISTS total_correct INTEGER DEFAULT 0;

-- 3. 添加 total_wrong 列
ALTER TABLE review_records ADD COLUMN IF NOT EXISTS total_wrong INTEGER DEFAULT 0;

-- ============================================
-- 验证修复结果
-- ============================================

-- 查看表结构
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'review_records'
ORDER BY ordinal_position;

-- 如果看到以下列，说明修复成功：
-- record_id, user_id, word_id, level, next_review_time,
-- total_correct, total_wrong, created_at, updated_at
