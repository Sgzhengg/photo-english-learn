# 头像显示和多用户问题 - 快速修复指南

## 🔴 问题诊断

### 问题1：头像上传后无法显示
**原因**：数据库 `avatar_url` 字段类型为 `VARCHAR(512)`，无法存储 base64 图片（通常几万字符）

### 问题2：显示"开发者"而不是用户名
**原因**：Zeabur 环境变量 `SKIP_AUTH=true`，使用固定虚拟用户

### 问题3：多个用户共享生词库
**原因**：所有用户使用同一个虚拟账号（user_id=999999）

---

## ✅ 快速修复方案

### 步骤1：修复头像字段（必须执行）

**在 Zeabur PostgreSQL 数据库中执行**：

```sql
-- 修改字段类型
ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT;

-- 验证修改
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'avatar_url';
-- 应该显示：avatar_url | text
```

---

### 步骤2：自动生成用户ID（已完成）✨

前端代码已自动修改，每个浏览器会生成唯一的 `anonymous_user_id`，例如：
- 浏览器A：`anon_1738276354827_a1b2c3d4e`
- 浏览器B：`anon_1738276412345_z9y8x7w6v`

**效果**：
- ✅ 每个浏览器有独立的用户账号
- ✅ 生词库不会共享
- ✅ 练习进度隔离
- ✅ 头像上传独立

---

### 步骤3：清除旧数据（可选）

如果想清理之前共享的虚拟用户数据：

```sql
-- 删除虚拟用户的生词
DELETE FROM user_words WHERE user_id = 999999;

-- 删除虚拟用户的复习记录
DELETE FROM review_records WHERE user_id = 999999;
```

---

## 🚀 生产环境配置（推荐）

### 关闭 SKIP_AUTH，使用真实用户系统

在 Zeabur 所有服务的环境变量中设置：

```yaml
env:
  - SKIP_AUTH=false
  - JWT_SECRET_KEY=your-super-secret-key-change-this
```

**效果**：
- 每个用户需要注册登录
- 完整的用户隔离
- 数据安全性更高

---

## 📊 验证修复

### 测试1：头像上传
1. 打开浏览器A，上传头像 → 应该显示成功
2. 刷新页面 → 头像应该仍然显示
3. 打开浏览器B → 不应该看到浏览器A的头像

### 测试2：数据隔离
1. 浏览器A添加单词 "apple"
2. 浏览器B添加单词 "banana"
3. 检查浏览器A的生词库 → 应该只有 "apple"
4. 检查浏览器B的生词库 → 应该只有 "banana"

### 测试3：用户ID
打开浏览器控制台，应该看到：
```
✅ Generated anonymous user ID: anon_1738276354827_a1b2c3d4e
```

---

## 📝 相关文件

- `MULTI_USER_SETUP.md` - 完整的多用户配置文档
- `shared/database/migrate_avatar_to_text.sql` - 数据库迁移脚本
- `frontend/src/lib/api.ts` - 匿名用户ID生成逻辑

---

## ❓ 常见问题

**Q: 为什么不直接关闭 SKIP_AUTH？**
A: 可以关闭，但需要修改 Zeabur 环境变量并重新部署。当前的匿名用户ID方案更简单，不需要重启服务。

**Q: 匿名用户ID会冲突吗？**
A: 不会。使用时间戳 + 随机字符串，碰撞概率极低。

**Q: 数据会丢失吗？**
A: 不会。每个浏览器都有独立的 user_id，数据存储在数据库中，不会互相覆盖。

**Q: 如何查看自己的匿名用户ID？**
A: 打开浏览器控制台，查看 "Generated anonymous user ID" 日志，或在 localStorage 中查找 "anonymous_user_id" 键。

---

## 🎯 总结

| 问题 | 状态 | 解决方案 |
|------|------|---------|
| 头像字段太小 | ⚠️ 需手动执行 | 执行 SQL: ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT |
| 显示"开发者" | ✅ 已自动修复 | 每个浏览器生成唯一用户ID |
| 数据共享 | ✅ 已自动修复 | 匿名用户ID隔离 |
| 生产环境 | 📋 推荐配置 | 设置 SKIP_AUTH=false |

**下一步操作**：
1. ⭐ **必须**：在 Zeabur PostgreSQL 中执行 SQL 迁移
2. ✅ 自动：前端已生成匿名用户ID
3. 📋 可选：配置 SKIP_AUTH=false（生产环境）
