# 多用户支持配置说明

## 当前问题

### 问题1：显示"开发者"
**原因**：Zeabur 环境变量中设置了 `SKIP_AUTH=true`，导致使用固定虚拟用户（user_id=999999, nickname="开发用户"）

### 问题2：多个用户共享数据
**原因**：在 SKIP_AUTH 模式下，所有用户都使用同一个虚拟账号，所以：
- 生词库被所有用户共享
- 练习进度被所有用户共享
- 头像上传也是上传到同一个账号

### 问题3：头像无法显示
**原因**：可能是数据库字段仍然是 VARCHAR(512)，需要执行迁移脚本

---

## 解决方案

### 方案A：关闭 SKIP_AUTH（推荐）

**优点**：
- ✅ 完整的用户隔离
- ✅ 每个用户有自己的账号和密码
- ✅ 数据完全隔离，不会共享
- ✅ 生产环境推荐方案

**操作步骤**：

#### 1. 修改 Zeabur 环境变量
在所有服务的环境变量中删除或设置 `SKIP_AUTH=false`：

```yaml
services:
  - name: auth-service
    env:
      - SKIP_AUTH=false  # 关闭开发模式

  - name: word-service
    env:
      - SKIP_AUTH=false

  - name: practice-service
    env:
      - SKIP_AUTH=false

  - name: photo-service
    env:
      - SKIP_AUTH=false

  - name: api-gateway
    env:
      - SKIP_AUTH=false
```

#### 2. 注册新用户
重新部署后，访问应用，使用注册功能创建多个账号：
- 用户A注册：user_a@example.com / password123
- 用户B注册：user_b@example.com / password123
- 用户C注册：user_c@example.com / password123

#### 3. 用户数据隔离
后端已正确实现用户数据隔离：
```python
# 所有查询都过滤了 user_id
query = select(UserWord).where(UserWord.user_id == current_user.user_id)
```

每个用户只能看到自己的生词库和进度。

---

### 方案B：使用 X-Anonymous-User-ID 头（临时方案）

**适用场景**：不想关闭 SKIP_AUTH，但需要临时区分用户

**缺点**：
- ❌ 需要手动修改请求头
- ❌ 不安全，任何人都可以模拟其他用户
- ❌ 仅适合开发测试

**操作步骤**：

#### 前端添加请求头
修改 `frontend/src/lib/api.ts`，在 fetch 请求中添加：

```typescript
// 在拦截器中添加
const anonymousUserId = localStorage.getItem('anonymous_user_id');
if (!anonymousUserId) {
  // 生成唯一的用户ID
  const newId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('anonymous_user_id', newId);
}

headers: {
  ...existingHeaders,
  'X-Anonymous-User-ID': anonymousUserId || localStorage.getItem('anonymous_user_id'),
}
```

**注意**：这只是临时方案，生产环境必须使用方案A。

---

## 数据库迁移

### 修复头像字段类型

在 Zeabur PostgreSQL 数据库中执行以下 SQL：

```sql
-- 检查当前字段类型
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'avatar_url';

-- 如果是 VARCHAR(512)，执行以下命令修改为 TEXT
ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT;

-- 验证修改
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'avatar_url';
```

---

## 验证多用户隔离

### 测试步骤

1. **用户A登录**，添加单词 "apple"
2. **退出登录**
3. **用户B登录**，添加单词 "banana"
4. **检查用户A的生词库**：应该只看到 "apple"，不应该看到 "banana"
5. **检查用户B的生词库**：应该只看到 "banana"，不应该看到 "apple"

### 后端验证查询

检查数据库中的用户数据隔离：

```sql
-- 查看所有用户
SELECT user_id, username, email, nickname FROM users;

-- 查看用户A的生词（假设 user_id=1）
SELECT uw.id, w.english_word, uw.user_id
FROM user_words uw
JOIN words w ON uw.word_id = w.word_id
WHERE uw.user_id = 1;

-- 查看用户B的生词（假设 user_id=2）
SELECT uw.id, w.english_word, uw.user_id
FROM user_words uw
JOIN words w ON uw.word_id = w.word_id
WHERE uw.user_id = 2;
```

应该看到不同的 user_id 和单词列表。

---

## 推荐配置

### 生产环境配置

```yaml
# zeabur.yaml
services:
  - name: auth-service
    env:
      - SKIP_AUTH=false
      - JWT_SECRET_KEY=your-super-secret-jwt-key-change-this
      - JWT_ALGORITHM=HS256
      - JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

  - name: word-service
    env:
      - SKIP_AUTH=false

  # ... 其他服务同样设置 SKIP_AUTH=false
```

### 安全建议

1. **修改 JWT_SECRET_KEY**：不要使用默认值
2. **启用 HTTPS**：Zeabur 自动提供
3. **设置合理的 Token 过期时间**：30分钟到1小时
4. **实现刷新 Token 机制**：目前代码已支持

---

## 总结

| 问题 | 根本原因 | 解决方案 |
|------|---------|---------|
| 显示"开发者" | SKIP_AUTH=true | 设置 SKIP_AUTH=false |
| 数据共享 | 所有用户使用同一个虚拟账号 | 使用真实JWT认证，每个用户独立注册 |
| 头像无法显示 | 数据库字段 VARCHAR(512) 太小 | 执行 SQL 迁移改为 TEXT |

**推荐操作**：
1. 执行数据库迁移（修复头像字段）
2. 修改 Zeabur 环境变量（关闭 SKIP_AUTH）
3. 重新部署服务
4. 注册多个用户账号
5. 验证数据隔离
