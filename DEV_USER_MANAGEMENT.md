# 开发环境用户管理指南

## 概述

为了方便测试，我在后端添加了两个临时开发端点：
- `GET /auth/dev/list-users` - 列出所有用户
- `DELETE /auth/dev/clear-user` - 根据邮箱删除用户

⚠️ **警告**：这些端点仅用于开发/测试环境，生产环境必须删除！

---

## 使用方法

### 1. 查看所有已注册用户

```bash
curl -X GET "https://photo-english-learn-api-gateway.zeabur.app/auth/dev/list-users"
```

**响应示例**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 3,
    "users": [
      {
        "user_id": 1,
        "username": "testuser",
        "email": "testuser@example.com",
        "nickname": "testuser",
        "created_at": "2026-01-31T15:07:03"
      },
      {
        "user_id": 2,
        "username": "testuser12345",
        "email": "testuser12345@example.com",
        "nickname": "testuser12345",
        "created_at": "2026-01-31T15:10:20"
      }
    ]
  }
}
```

---

### 2. 删除指定用户

```bash
curl -X DELETE "https://photo-english-learn-api-gateway.zeabur.app/auth/dev/clear-user" \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser12345@example.com"}'
```

**响应示例**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "message": "用户已删除: testuser12345@example.com",
    "user_id": 2,
    "username": "testuser12345"
  }
}
```

---

## 完整操作流程

### 步骤 1: 查看当前用户

```bash
# 查看所有用户
curl -X GET "https://photo-english-learn-api-gateway.zeabur.app/auth/dev/list-users"
```

### 步骤 2: 删除指定用户

```bash
# 删除特定邮箱的用户
curl -X DELETE "https://photo-english-learn-api-gateway.zeabur.app/auth/dev/clear-user" \
  -H "Content-Type: application/json" \
  -d '{"email": "18826181628@139.com"}'
```

### 步骤 3: 重新注册

删除后，该邮箱可以重新用于注册。

---

## 常见场景

### 场景 1: 邮箱已注册，想重新测试注册流程

```bash
# 1. 删除该邮箱用户
curl -X DELETE "https://photo-english-learn-api-gateway.zeabur.app/auth/dev/clear-user" \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'

# 2. 在前端重新注册
# 使用相同的邮箱和任意6位验证码即可注册成功
```

### 场景 2: 清理所有测试用户

```bash
# 1. 先查看所有用户
curl -X GET "https://photo-english-learn-api-gateway.zeabur.app/auth/dev/list-users"

# 2. 逐个删除（复制上面的邮箱）
curl -X DELETE "https://photo-english-learn-api-gateway.zeabur.app/auth/dev/clear-user" \
  -H "Content-Type: application/json" \
  -d '{"email": "user1@example.com"}'

curl -X DELETE "https://photo-english-learn-api-gateway.zeabur.app/auth/dev/clear-user" \
  -H "Content-Type: application/json" \
  -d '{"email": "user2@example.com"}'

# ... 继续删除其他用户
```

---

## 安全提示

⚠️ **重要**：

1. 这些端点会永久删除用户数据，操作不可恢复
2. 仅在开发/测试环境使用
3. 部署到生产环境前必须删除这些端点
4. 删除端点位置：`services/auth-service/main.py` 第 510-597 行

---

## 如何删除这些开发端点（生产部署前）

在 `services/auth-service/main.py` 文件中，删除以下部分：

```python
# =============================================================================
# 临时开发端点 - 仅用于测试，生产环境必须删除！
# =============================================================================

@app.delete("/dev/clear-user", tags=["Dev"])
async def clear_user_by_email(...):
    ...

@app.get("/dev/list-users", tags=["Dev"])
async def list_all_users(...):
    ...
```

---

## 其他清除方法

### 方法 2: 使用 Zeabur 数据库管理界面

1. 登录 [Zeabur 控制台](https://zeabur.com/)
2. 进入你的项目
3. 找到 PostgreSQL 数据库服务
4. 点击"管理"或"打开控制台"
5. 执行 SQL 命令：

```sql
-- 查看所有用户
SELECT user_id, username, email, nickname, created_at
FROM users
ORDER BY created_at DESC;

-- 删除指定用户
DELETE FROM users
WHERE email = '18826181628@139.com';

-- 删除所有测试用户（谨慎使用）
-- DELETE FROM users WHERE email LIKE '%@example.com';
```

### 方法 3: 使用 psql 命令行

```bash
# 连接到数据库（需要 Zeabur 提供的连接信息）
psql -h <host> -U <user> -d <database> -p <port>

# 在 psql 中执行
SELECT * FROM users;
DELETE FROM users WHERE email = '18826181628@139.com';
```

---

## 快速测试命令

```bash
# 设置你的邮箱变量
EMAIL="18826181628@139.com"

# 查看所有用户
echo "=== 查看所有用户 ==="
curl -X GET "https://photo-english-learn-api-gateway.zeabur.app/auth/dev/list-users"

# 删除指定用户
echo "=== 删除用户: $EMAIL ==="
curl -X DELETE "https://photo-english-learn-api-gateway.zeabur.app/auth/dev/clear-user" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\"}"

# 验证删除
echo "=== 验证删除结果 ==="
curl -X GET "https://photo-english-learn-api-gateway.zeabur.app/auth/dev/list-users"
```

---

## 部署更新

后端代码已更新，需要重新部署 auth-service：

```bash
cd E:\photo-english-learn
git add services/auth-service/main.py
git commit -m "feat: add dev endpoints for user management

- Add GET /auth/dev/list-users to list all users
- Add DELETE /auth/dev/clear-user to remove user by email
- WARNING: These endpoints must be removed before production deployment"
git push origin main
```

等待 Zeabur 自动部署后即可使用这些端点。
