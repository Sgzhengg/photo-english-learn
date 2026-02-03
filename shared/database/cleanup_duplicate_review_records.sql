-- ============================================
-- 清理重复的复习记录
-- 对于每个用户的每个单词，保留最早创建的一条记录
-- ============================================

-- 查看重复的复习记录
SELECT
    user_id,
    word_id,
    COUNT(*) as duplicate_count
FROM review_records
GROUP BY user_id, word_id
HAVING COUNT(*) > 1;

-- 删除重复记录，保留最早创建的一条（使用 record_id 最小的）
DELETE FROM review_records
WHERE record_id NOT IN (
    SELECT MIN(record_id)
    FROM review_records
    GROUP BY user_id, word_id
);

-- 验证删除结果
SELECT
    user_id,
    word_id,
    COUNT(*) as count
FROM review_records
GROUP BY user_id, word_id
HAVING COUNT(*) > 1;

-- 如果上面的查询返回空，说明没有重复记录了
-- 显示剩余的复习记录
SELECT COUNT(*) as total_review_records
FROM review_records;

-- 显示每个用户的复习记录数量
SELECT
    user_id,
    COUNT(*) as review_count
FROM review_records
GROUP BY user_id
ORDER BY review_count DESC;
