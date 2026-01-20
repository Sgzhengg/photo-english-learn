-- ============================================
-- 一次性修复所有数据库问题
-- 在 Zeabur PostgreSQL 控制台执行
-- ============================================

-- 1. 修复 words 表 - 添加缺失的音标字段
-- ============================================
ALTER TABLE words ADD COLUMN IF NOT EXISTS phonetic_us VARCHAR(50);
ALTER TABLE words ADD COLUMN IF NOT EXISTS phonetic_uk VARCHAR(50);

COMMENT ON COLUMN words.phonetic_us IS '美式音标';
COMMENT ON COLUMN words.phonetic_uk IS '英式音标';


-- 2. 创建缺失的 tags 表
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
    tag_id SERIAL PRIMARY KEY,
    tag_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20),  -- 标签颜色，如 '#FF5733'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE tags IS '标签表 - 用于单词分类';
COMMENT ON COLUMN tags.tag_name IS '标签名称，如"厨房"、"咖啡"';
COMMENT ON COLUMN tags.color IS '标签颜色（十六进制）';


-- 3. 插入默认标签数据
-- ============================================
INSERT INTO tags (tag_name, description, color) VALUES
    ('生词', '新学习的单词', '#FF6B6B'),
    ('学习中', '正在复习的单词', '#4ECDC4'),
    ('熟悉', '基本掌握的单词', '#45B7D1'),
    ('掌握', '已经熟练掌握的单词', '#96CEB4'),
    ('厨房', '厨房相关词汇', '#FFEAA7'),
    ('咖啡', '咖啡相关词汇', '#DFE6E9'),
    ('旅行', '旅行相关词汇', '#74B9FF')
ON CONFLICT (tag_name) DO NOTHING;


-- 4. 验证修复结果
-- ============================================

-- 检查 words 表字段
SELECT 'words 表字段:' as info;
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'words'
ORDER BY ordinal_position;

-- 检查 tags 表是否存在
SELECT '\ntags 表字段:' as info;
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tags'
ORDER BY ordinal_position;

-- 检查默认标签数据
SELECT '\n默认标签:' as info;
SELECT tag_id, tag_name, description, color
FROM tags;
