-- ============================================
-- 清理孤立的复习记录
-- 删除那些 user_words 中已不存在但 review_records 中仍存在的记录
-- ============================================

-- 查看孤立的复习记录数量
SELECT COUNT(*) as orphan_count
FROM review_records rr
WHERE NOT EXISTS (
    SELECT 1
    FROM user_words uw
    WHERE uw.user_id = rr.user_id
    AND uw.word_id = rr.word_id
);

-- 删除孤立的复习记录
DELETE FROM review_records
WHERE NOT EXISTS (
    SELECT 1
    FROM user_words
    WHERE user_words.user_id = review_records.user_id
    AND user_words.word_id = review_records.word_id
);

-- 验证删除结果
SELECT COUNT(*) as remaining_count
FROM review_records;

-- 显示剩余的复习记录（应该与生词库中的单词数量一致）
SELECT
    rr.record_id,
    rr.user_id,
    rr.word_id,
    w.english_word,
    rr.next_review_time
FROM review_records rr
JOIN words w ON rr.word_id = w.word_id
ORDER BY rr.next_review_time;
