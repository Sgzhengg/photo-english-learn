-- ============================================
-- 修复 review_records 表 - 添加缺失的 level 列
-- 在 Zeabur PostgreSQL 控制台执行
-- ============================================

-- 添加缺失的 level 列
ALTER TABLE review_records ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0;

-- 验证列已添加
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'review_records'
ORDER BY ordinal_position;

-- 显示表结构
SELECT '\nreview_records 表结构:' as info;
\d review_records
