-- 清除测试数据脚本
-- 使用方法：在 Zeabur 数据库控制台或使用 psql 客户端执行

-- ============================================
-- 方案 1: 清除所有测试数据（推荐用于开发环境）
-- ============================================

-- 1. 清除用户生词关联（user_words）
-- 这会解除用户与词汇的关联，但保留全局词库
TRUNCATE TABLE user_words CASCADE;

-- 2. 清除复习记录
TRUNCATE TABLE review_records CASCADE;

-- 3. 清除标签（可选）
-- 注意：如果有自定义标签，会被删除
TRUNCATE TABLE tags CASCADE;

-- 4. 重置标签序列（重新从 1 开始）
ALTER SEQUENCE tags_tag_id_seq RESTART WITH 1;

-- 插入默认标签
INSERT INTO tags (tag_name, description, color) VALUES
  ('生词', '需要学习的生词', '#ef4444'),
  ('学习中', '正在学习中的单词', '#f59e0b'),
  ('熟悉', '已经熟悉的单词', '#3b82f6'),
  ('掌握', '已经掌握的单词', '#10b981');

-- ============================================
-- 方案 2: 完全清空所有数据（包括全局词库）
-- ============================================

-- 取消下面的注释来执行完全清空
-- TRUNCATE TABLE words CASCADE;
-- TRUNCATE TABLE user_words CASCADE;
-- TRUNCATE TABLE review_records CASCADE;
-- TRUNCATE TABLE tags CASCADE;
-- TRUNCATE TABLE scenes CASCADE;
-- TRUNCATE TABLE users CASCADE;

-- 重置所有序列
-- ALTER SEQUENCE words_word_id_seq RESTART WITH 1;
-- ALTER SEQUENCE user_words_id_seq RESTART WITH 1;
-- ALTER SEQUENCE review_records_record_id_seq RESTART WITH 1;
-- ALTER SEQUENCE tags_tag_id_seq RESTART WITH 1;
-- ALTER SEQUENCE scenes_scene_id_seq RESTART WITH 1;
-- ALTER SEQUENCE users_user_id_seq RESTART WITH 1;

-- ============================================
-- 方案 3: 只清除特定用户的测试数据
-- ============================================

-- 如果只想清除特定用户的数据，先查询用户 ID
-- SELECT user_id, username FROM users;

-- 然后删除该用户的数据（替换 {user_id} 为实际 ID）
-- DELETE FROM user_words WHERE user_id = {user_id};
-- DELETE FROM review_records WHERE user_id = {user_id};

-- ============================================
-- 查询数据量（执行前查看）
-- ============================================

-- 查看当前数据量
SELECT 'words' as table_name, COUNT(*) as count FROM words
UNION ALL
SELECT 'user_words', COUNT(*) FROM user_words
UNION ALL
SELECT 'review_records', COUNT(*) FROM review_records
UNION ALL
SELECT 'tags', COUNT(*) FROM tags
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'scenes', COUNT(*) FROM scenes;
