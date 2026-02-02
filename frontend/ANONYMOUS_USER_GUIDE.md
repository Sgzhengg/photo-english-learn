# 匿名用户ID机制说明

## 📋 概述

为了支持多用户测试时无需注册登录，同时保证数据隔离，我们实现了**匿名用户ID机制**。

### 核心特性
- ✅ 无需注册登录，打开即用
- ✅ 每个浏览器/设备有独立的用户ID
- ✅ 数据完全隔离，互不干扰
- ✅ 跨会话持久化（基于localStorage）
- ✅ 后端自动创建/识别匿名用户

---

## 🏗️ 技术实现

### 前端实现

#### 1. 匿名用户ID生成
```typescript
// src/lib/anonymous-user.ts

// ID格式: anon_{timestamp}_{random}
// 示例: anon_1706208000000_a3f8k2
```

**特性**：
- 自动检测 localStorage 是否已有ID
- 如无ID，自动生成新ID
- ID持久化存储，跨会话保留

#### 2. API 请求自动添加头
```typescript
// src/lib/api.ts

// 所有 API 请求自动添加
headers['X-Anonymous-User-ID'] = getOrCreateAnonymousUserId();
```

### 后端实现

#### 1. 认证流程改造
```python
# shared/utils/auth.py

async def get_current_user(request: Request, ...):
    if SKIP_AUTH:
        anonymous_user_id = request.headers.get("X-Anonymous-User-ID")

        if anonymous_user_id:
            # 查找或创建匿名用户
            user = await find_or_create_user(anonymous_user_id)
            return user

        # 回退到固定虚拟用户
        return dev_user
```

#### 2. 数据库设计
```sql
-- 用户表
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE,  -- 存储匿名用户ID
  email VARCHAR(255),
  nickname VARCHAR(100),
  english_level VARCHAR(20),
  ...
);

-- 索引
CREATE INDEX idx_users_username ON users(username);
```

---

## 🎯 使用场景

### 场景1：多用户测试

**测试用户A（手机）**：
1. 打开应用 → 自动生成ID: `anon_001`
2. 拍照识别 → 数据关联到 `anon_001`
3. 查看生词库 → 只看到自己的数据

**测试用户B（电脑）**：
1. 打开应用 → 自动生成ID: `anon_002`
2. 拍照识别 → 数据关联到 `anon_002`
3. 查看生词库 → 只看到自己的数据

**结果**：完全隔离 ✅

### 场景2：跨设备访问

**同一用户**：
- 手机浏览器：匿名ID A → 数据集A
- 电脑浏览器：匿名ID B → 数据集B
- **数据不同步**（符合预期）

### 场景3：清除数据

用户清除浏览器数据后：
- localStorage 被清空
- 重新访问会生成新的匿名ID
- 旧数据"遗弃"在数据库中

---

## 🔧 配置要求

### 前端
无需额外配置，自动工作。

### 后端环境变量
```bash
# 启用开发模式（必须）
SKIP_AUTH=true
```

### Zeabur 部署
在需要匿名用户的服务上设置：
- ✅ word-service
- ✅ practice-service
- ✅ auth-service
- ✅ vision-service（如果需要用户关联）

---

## 📊 数据管理

### 查看匿名用户ID

**前端控制台**：
```javascript
// 浏览器控制台执行
import { getAnonymousUserInfo } from './src/lib/anonymous-user';
console.log(getAnonymousUserInfo());

// 输出示例:
{
  userId: "anon_1706208000000_a3f8k2",
  createdAt: "2025-01-26T10:30:00Z",
  isAnonymous: true
}
```

**后端日志**：
```bash
# Zeabur 服务日志
[AnonymousUser] Processing anonymous user: anon_1706208000000_a3f8k2
[AnonymousUser] Found existing user: 1001
```

### 清除匿名用户ID

```javascript
// 浏览器控制台执行
import { clearAnonymousUserId } from './src/lib/anonymous-user';
clearAnonymousUserId();
// 刷新页面后将生成新ID
```

### 数据库查询

```sql
-- 查看所有匿名用户
SELECT user_id, username, nickname, created_at
FROM users
WHERE username LIKE 'anon_%'
ORDER BY created_at DESC;

-- 统计匿名用户数量
SELECT COUNT(*) as anonymous_users
FROM users
WHERE username LIKE 'anon_%';

-- 查看特定匿名用户的生词
SELECT u.username, w.english_word, uw.created_at
FROM users u
JOIN user_words uw ON u.user_id = uw.user_id
JOIN words w ON uw.word_id = w.word_id
WHERE u.username LIKE 'anon_%'
ORDER BY uw.created_at DESC;
```

---

## ⚠️ 注意事项

### 1. 数据隔离
- ✅ 同一浏览器：数据持久化
- ✅ 不同浏览器：数据隔离
- ✅ 跨设备：数据隔离

### 2. ID 丢失场景
匿名用户ID会在以下情况丢失：
- 用户清除浏览器数据
- 用户卸载应用（PWA）
- 用户使用隐私模式/无痕浏览

**解决方案**：
- 前端：自动生成新ID（无感）
- 后端：旧数据保留在数据库中（不影响）

### 3. 性能考虑
- 每次首次访问需要创建数据库记录（一次性开销）
- 后续访问直接查询（已有索引）
- 日志记录方便调试（生产环境可关闭）

### 4. 安全性
- 匿名用户ID不是秘密，可以暴露
- 不包含敏感信息
- 不用于认证授权（仅用于数据隔离）

---

## 🚀 后续优化

### 短期优化
1. 添加匿名用户ID显示在设置页面
2. 提供"清除我的数据"功能
3. 优化日志级别（生产环境）

### 长期规划
1. **账号迁移功能**：
   ```
   匿名用户使用一段时间 → 注册正式账号
   → 系统将匿名数据迁移到正式账号
   → 跨设备同步数据
   ```

2. **数据导出**：
   - 允许用户导出自己的学习数据
   - 支持 JSON/CSV 格式

3. **跨设备同步**：
   - 可选的云同步功能
   - 需要简单的账号系统

---

## 🧪 测试验证

### 本地测试

1. **测试数据隔离**：
   ```bash
   # 浏览器A（Chrome）
   1. 打开应用
   2. 添加生词 "test-word-A"
   3. 记录匿名ID（控制台查看）

   # 浏览器B（Edge）
   1. 打开应用（新窗口）
   2. 检查生词库（应该为空）
   3. 添加生词 "test-word-B"
   4. 返回浏览器A，确认看不到 "test-word-B"
   ```

2. **测试持久化**：
   ```bash
   1. 打开应用，添加生词
   2. 关闭浏览器
   3. 重新打开应用
   4. 确认生词仍然存在
   ```

3. **测试ID清除**：
   ```bash
   1. 打开应用，记录当前ID
   2. 清除浏览器数据
   3. 刷新页面
   4. 确认生成了新ID（数据重置）
   ```

### 部署后测试

1. **Zeabur 日志检查**：
   ```bash
   # 查看服务日志
   # 应该看到 [AnonymousUser] 相关日志
   ```

2. **多用户并发测试**：
   - 邀请3-5个测试用户
   - 同时使用应用
   - 确认数据不会互相干扰

---

## 📚 相关文件

### 前端
- `src/lib/anonymous-user.ts` - 匿名用户工具模块
- `src/lib/api.ts` - API 客户端（已添加匿名用户头）

### 后端
- `shared/utils/auth.py` - 认证模块（支持匿名用户）

### 文档
- `DEV_MODE_NOTES.md` - 开发模式配置
- `ZEABUR_DEV_MODE_SETUP.md` - Zeabur 部署指南
- `ANONYMOUS_USER_GUIDE.md` - 本文档

---

**文档版本**：v1.0
**最后更新**：2025-02-01
**状态**：✅ 已实现并测试
