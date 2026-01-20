# 📊 数据库优化执行清单

**脚本位置**: `shared/database/optimization.sql`

---

## ✅ 已完成的步骤

### 1. 更新表统计信息
你已经执行了 `ANALYZE` 命令，PostgreSQL 已完成：
```
checkpoint complete: wrote 15 buffers
```

---

## 🔲 待完成的步骤

### 2. 创建索引（最重要！）

在 Zeabur PostgreSQL 控制台中执行以下 SQL：

```sql
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

-- 用户生词索引
CREATE INDEX IF NOT EXISTS idx_user_words_user_id_word_id ON user_words(user_id, word_id);
CREATE INDEX IF NOT EXISTS idx_user_words_user_id_created_at ON user_words(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_words_tag_id ON user_words(tag_id);

-- 场景句子索引
CREATE INDEX IF NOT EXISTS idx_scene_sentences_scene_id ON scene_sentences(scene_id);
CREATE INDEX IF NOT EXISTS idx_scene_sentences_created_at ON scene_sentences(created_at DESC);

-- 复习记录索引（关键！）
CREATE INDEX IF NOT EXISTS idx_review_records_user_id_next_review ON review_records(user_id, next_review_time);
CREATE INDEX IF NOT EXISTS idx_review_records_next_review_time ON review_records(next_review_time);
CREATE INDEX IF NOT EXISTS idx_review_records_level ON review_records(level);

-- 练习记录索引
CREATE INDEX IF NOT EXISTS idx_practice_records_user_id_created_at ON practice_records(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_practice_records_sentence_id ON practice_records(sentence_id);
```

### 3. 验证索引创建

执行以下命令查看已创建的索引：

```sql
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

你应该看到约 20+ 个新索引。

---

## 📈 预期性能提升

创建索引后，以下查询将显著加速：

| 查询类型 | 优化前 | 优化后 | 提升 |
|---------|--------|--------|------|
| 用户登录 | 50-200ms | 5-20ms | **10倍** |
| 单词查询 | 100-300ms | 10-50ms | **6-30倍** |
| 用户词库列表 | 500-1000ms | 50-200ms | **5-20倍** |
| 复习列表查询 | 500-1000ms | 50-200ms | **5-20倍** |
| 场景物体查询 | 200-500ms | 20-100ms | **5-25倍** |

---

## 🎯 执行方式

### 方式一：在 Zeabur 控制台执行
1. 进入 Zeabur PostgreSQL 服务
2. 点击 "Console" 或 "Terminal"
3. 复制上面的 SQL 语句粘贴进去
4. 按回车执行

### 方式二：使用 psql 客户端
```bash
psql $DATABASE_URL < shared/database/optimization.sql
```

---

## ⚠️ 注意事项

1. **索引创建时间**：取决于数据量，通常需要几秒到几分钟
2. **磁盘空间**：索引会占用额外空间（约表大小的 10-30%）
3. **写操作影响**：索引会轻微降低 INSERT/UPDATE 速度（通常可忽略）
4. **IF NOT EXISTS**：使用此子句，重复执行不会报错

---

## 📊 执行后检查

创建完索引后，执行此命令查看效果：

```sql
-- 查看表和索引大小
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

**更新时间**: 2026-01-20
