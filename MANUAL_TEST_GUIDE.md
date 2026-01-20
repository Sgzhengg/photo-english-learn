# 🧪 后端优化手动测试指南

**测试日期**: 2026-01-20

---

## 📋 测试清单

### ✅ 第一步：验证服务运行

访问以下 URL 确认服务正常：

- API Gateway: `http://your-gateway-url/`
- Auth Service: `http://your-auth-service-url/`
- Word Service: `http://your-word-service-url/`
- Vision Service: `http://your-vision-service-url/`
- Practice Service: `http://your-practice-service-url/`
- TTS Service: `http://your-tts-service-url/`

预期：返回 `{"code": 0, "message": "...", "data": {"service": "..."}}`

---

### ✅ 第二步：测试 Redis 缓存

#### 测试单词查询缓存

使用 curl 或 Postman：

```bash
# 第一次查询（从数据库）
curl -w "\nTime: %{time_total}s\n" http://your-word-service-url/lookup/cup

# 等待 1 秒
sleep 1

# 第二次查询（从缓存，应该更快）
curl -w "\nTime: %{time_total}s\n" http://your-word-service-url/lookup/cup

# 等待 1 秒
sleep 1

# 第三次查询（确认缓存持续有效）
curl -w "\nTime: %{time_total}s\n" http://your-word-service-url/lookup/cup
```

**预期结果**：
- 第二次和第三次的响应时间应该比第一次快 **2-10 倍**
- 日志中应该看到：
  ```
  [INFO] 单词从数据库获取: cup
  [INFO] 单词已缓存: cup
  [INFO] 缓存命中: word_lookup:cup
  ```

#### 测试标签列表缓存

```bash
# 第一次查询
curl http://your-word-service-url/tags/list

# 第二次查询（从缓存）
curl http://your-word-service-url/tags/list
```

---

### ✅ 第三步：测试请求限流

#### 测试登录限流（20 次/分钟）

使用以下脚本快速测试：

```bash
#!/bin/bash
echo "测试登录限流..."
for i in {1..25}; do
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"wrong"}' \
    http://your-auth-service-url/login)

  if [ "$response" = "429" ]; then
    echo "第 $i 次请求：限流触发 (HTTP 429) ✅"
    break
  fi

  echo "第 $i 次请求：HTTP $response"
  sleep 0.1
done
```

**预期结果**：
- 在第 21-25 次请求时应该收到 `HTTP 429 Too Many Requests`
- 响应体包含：
  ```json
  {
    "detail": {
      "error": "Too many requests",
      "message": "请求过于频繁，请在 60 秒后重试",
      "retry_after": 60
    }
  }
  ```

#### 测试图片分析限流（10 次/分钟）

```bash
#!/bin/bash
echo "测试图片分析限流..."
for i in {1..15}; do
  response=$(curl -s -o /dev/null -w "%{http_code}" \
    -F "image=@test.jpg" \
    http://your-vision-service-url/analyze)

  if [ "$response" = "429" ]; then
    echo "第 $i 次请求：限流触发 (HTTP 429) ✅"
    break
  fi

  echo "第 $i 次请求：HTTP $response"
  sleep 0.2
done
```

---

### ✅ 第四步：验证数据库索引

#### 在 Zeabur PostgreSQL 控制台执行

```sql
-- 查看所有索引
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**预期结果**：应该看到约 20+ 个索引，包括：
- `idx_users_username`
- `idx_words_english_word`
- `idx_review_records_user_id_next_review`
- 等等...

#### 查看表和索引大小

```sql
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**预期结果**：每个表应该有索引占用空间

---

### ✅ 第五步：性能对比测试

#### 测试用户登录（应该很快）

```bash
time curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"your_user","password":"your_password"}' \
  http://your-auth-service-url/login
```

**预期**：响应时间 < 100ms

#### 测试单词查询

```bash
time curl http://your-word-service-url/lookup/laptop
```

**预期**：
- 第一次：< 300ms
- 第二次（缓存）：< 50ms

#### 测试复习列表（需要认证）

```bash
# 获取 token
TOKEN=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"your_user","password":"your_password"}' \
  http://your-auth-service-url/login | jq -r '.data.access_token')

# 测试复习列表
time curl -H "Authorization: Bearer $TOKEN" \
  http://your-practice-service-url/review
```

**预期**：响应时间 < 200ms

---

### ✅ 第六步：检查日志

在 Zeabur 控制台查看服务日志，应该看到：

```
[INFO] Redis 缓存已初始化: redis://...
[INFO] 单词从数据库获取: cup
[INFO] 单词已缓存: cup
[INFO] 缓存命中: word_lookup:cup
[INFO] 标签列表从缓存获取
[WARNING] 请求限流触发: ip:xxx.xxx.xxx.xxx
```

---

## 📊 性能基准

| 操作 | 优化前 | 优化后（缓存命中） | 目标 |
|-----|--------|------------------|------|
| 单词查询 | 200-500ms | 10-50ms | ✅ 10-50倍 |
| 标签列表 | 100-300ms | 5-20ms | ✅ 10-20倍 |
| 用户登录 | 50-200ms | 10-50ms | ✅ 2-10倍 |
| 复习列表 | 500-1000ms | 50-200ms | ✅ 5-20倍 |

---

## ⚠️ 常见问题

### 问题 1：缓存未生效

**检查**：
```bash
# 查看日志是否有 "Redis 连接失败"
# 检查 REDIS_URL 环境变量是否配置
# 在 Zeabur 确认 Redis 服务正在运行
```

### 问题 2：限流未触发

**原因**：
- 可能限制太宽松（尝试增加请求次数）
- 可能未配置 Redis
- 检查装饰器是否正确添加

### 问题 3：数据库查询仍然很慢

**检查**：
```sql
-- 确认索引已创建
SELECT indexname FROM pg_indexes WHERE schemaname = 'public';

-- 更新统计信息
ANALYZE;

-- 检查查询计划
EXPLAIN ANALYZE your_query_here;
```

---

## 🎯 测试通过标准

- ✅ 所有服务健康检查通过
- ✅ 缓存命中后响应速度提升 2 倍以上
- ✅ 请求限流在合理范围内触发
- ✅ 数据库有 20+ 个索引
- ✅ 日志显示 Redis 和限流正常工作
- ✅ 无错误日志

---

**测试完成后，请报告结果以便进一步优化！**
