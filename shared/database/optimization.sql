-- ============================================
-- 数据库优化脚本 - 添加索引和约束
-- ============================================
-- 执行方式：psql -U your_user -d photo_english -f optimization.sql
-- 或在 Zeabur PostgreSQL 控制台中直接执行
-- ============================================

-- 1. 为高频查询字段添加索引
-- ============================================

-- 用户表索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- 场景表索引
CREATE INDEX IF NOT EXISTS idx_scenes_user_id_created_at ON scenes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scenes_created_at ON scenes(created_at DESC);

-- 检测到的物体索引
CREATE INDEX IF NOT EXISTS idx_detected_objects_scene_id ON detected_objects(scene_id);
CREATE INDEX IF NOT EXISTS idx_detected_objects_english_word ON detected_objects(english_word);
CREATE INDEX IF NOT EXISTS idx_detected_objects_confidence ON detected_objects(confidence DESC);

-- 单词表索引
CREATE INDEX IF NOT EXISTS idx_words_english_word ON words(english_word);
CREATE INDEX IF NOT EXISTS idx_words_chinese_meaning ON words(chinese_meaning);
CREATE INDEX IF NOT EXISTS idx_words_created_at ON words(created_at DESC);

-- 用户生词索引（已有部分，补充）
CREATE INDEX IF NOT EXISTS idx_user_words_user_id_word_id ON user_words(user_id, word_id);
CREATE INDEX IF NOT EXISTS idx_user_words_user_id_created_at ON user_words(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_words_tag_id ON user_words(tag_id);

-- 场景句子索引
CREATE INDEX IF NOT EXISTS idx_scene_sentences_scene_id ON scene_sentences(scene_id);
CREATE INDEX IF NOT EXISTS idx_scene_sentences_created_at ON scene_sentences(created_at DESC);

-- 复习记录索引（优化复习查询）
CREATE INDEX IF NOT EXISTS idx_review_records_user_id_next_review ON review_records(user_id, next_review_time);
CREATE INDEX IF NOT EXISTS idx_review_records_next_review_time ON review_records(next_review_time);
CREATE INDEX IF NOT EXISTS idx_review_records_level ON review_records(level);

-- 练习记录索引
CREATE INDEX IF NOT EXISTS idx_practice_records_user_id_created_at ON practice_records(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_practice_records_sentence_id ON practice_records(sentence_id);

-- 2. 添加全文搜索索引（可选，用于高级搜索）
-- ============================================

-- 单词全文搜索
CREATE INDEX IF NOT EXISTS idx_words_english_word_gin ON words USING gin(english_word gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_words_chinese_meaning_gin ON words USING gin(chinese_meaning gin_trgm_ops);

-- 3. 分析表以更新统计信息
-- ============================================

ANALYZE users;
ANALYZE scenes;
ANALYZE detected_objects;
ANALYZE words;
ANALYZE user_words;
ANALYZE tags;
ANALYZE scene_sentences;
ANALYZE review_records;
ANALYZE practice_records;

-- 4. 查询索引使用情况（可选）
-- ============================================

-- 查看未使用的索引
-- SELECT
--     schemaname,
--     tablename,
--     indexname,
--     idx_scan as index_scans
-- FROM pg_stat_user_indexes
-- WHERE idx_scan = 0
-- AND indexname NOT LIKE '%_pkey';
--     AND indexrelid NOT IN (
--         SELECT indexrelid
--         FROM pg_constraint
--         WHERE contype IN ('p', 'u', 'f')
--     );

-- 5. 优化建议
-- ============================================

-- 定期运行 VACUUM ANALYZE 以保持性能
-- 建议设置 cron 任务或使用 PostgreSQL 的 autovacuum

-- 检查表膨胀
-- SELECT
--     schemaname,
--     tablename,
--     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
--     pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
--     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
-- FROM pg_tables
-- WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
-- ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ============================================
-- 完成
-- ============================================
-- 执行完成后，你的查询性能应该会有显著提升
-- ============================================
