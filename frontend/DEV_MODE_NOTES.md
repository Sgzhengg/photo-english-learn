# 开发模式配置说明

## ⚠️ 当前状态：跳过认证

为了方便开发和测试，应用目前**跳过了登录/注册流程**，用户可以直接访问所有功能。

---

## 📝 已修改的文件

### 前端修改

### 1. **前端路由** (`src/lib/router-config.tsx`)

**修改内容**：
- `protectedRouteLoader()` 函数：注释掉 token 检查
- 根路径 `/`：直接跳转到 `/app/photo-capture`，不再检查认证

**恢复方法**：
```typescript
const protectedRouteLoader = () => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return redirect('/login');
  }
  return null;
};
```

### 2. **API 客户端** (`src/lib/api.ts`)

**修改内容**：
- 401 错误处理：不再跳转到登录页，静默失败

**恢复方法**：
```typescript
// 如果 refresh 失败，清除 tokens 并跳转到登录
this.clearTokens();
window.location.href = '/login';
return { success: false, error: 'Session expired. Please login again.' };
```

### 后端修改

### 3. **认证工具** (`../photo-english-learn/shared/utils/auth.py`)

**修改内容**：
- 添加 `SKIP_AUTH` 环境变量支持
- `get_current_user()` 和 `get_current_user_optional()` 在开发模式下返回虚拟用户

**恢复方法**：
- 移除或设置环境变量 `SKIP_AUTH=false`

---

## 🚀 使用方式

### 本地开发

1. **启动后端服务**（需要设置环境变量）：
   ```bash
   # Linux/Mac
   export SKIP_AUTH=true

   # Windows (PowerShell)
   $env:SKIP_AUTH="true"

   # Windows (CMD)
   set SKIP_AUTH=true
   ```

2. **启动前端应用**：
   ```bash
   npm run dev
   ```

3. **访问应用**：
   - 打开浏览器访问 `http://localhost:5173`
   - 自动跳转到拍照页面
   - 无需登录即可使用

### Zeabur 部署

在 Zeabur 控制台设置环境变量：

1. 进入项目设置
2. 添加环境变量：
   - **变量名**: `SKIP_AUTH`
   - **值**: `true`
3. 重新部署所有受影响的服务：
   - auth-service
   - word-service
   - practice-service
   - 任何其他使用 `get_current_user` 的服务

**注意**: 由于 `shared/utils/auth.py` 是共享代码，修改后需要重新部署所有使用它的服务。

---

## ✅ 功能测试

启用 `SKIP_AUTH=true` 后：

| 功能 | 状态 | 说明 |
|------|------|------|
| 拍照识别 | ✅ 可用 | 不需要认证，直接可用 |
| 生词库 | ✅ 可用 | 使用虚拟用户 (user_id=999999) |
| 练习生成 | ✅ 可用 | 使用虚拟用户 |
| 复习系统 | ✅ 可用 | 使用虚拟用户 |
| 学习进度 | ✅ 可用 | 使用虚拟用户 |

**虚拟用户信息**：
- user_id: 999999
- username: dev_user
- email: dev@example.com
- nickname: 开发用户
- english_level: intermediate
- daily_goal: 20

---

## ⚠️ 注意事项

### 数据持久化
- **虚拟用户的数据会保存到数据库**，但使用 `user_id=999999`
- 重新部署后数据仍然存在（因为数据库没有重置）
- 如需清空测试数据，手动删除数据库中 `user_id=999999` 的相关记录

### 安全警告
- ⚠️ **生产环境必须禁用 `SKIP_AUTH`**
- 确保部署到生产前移除该环境变量
- 该功能仅用于开发和测试

---

## 🔄 恢复认证（上线前）

在正式发布前，需要恢复所有认证检查：

### 前端恢复

1. **恢复路由守卫**：
   - 编辑 `src/lib/router-config.tsx`
   - 取消注释 `protectedRouteLoader` 中的认证代码

2. **恢复 API 跳转**：
   - 编辑 `src/lib/api.ts`
   - 取消注释 `window.location.href = '/login'`

### 后端恢复

**方法1**: 移除环境变量
```bash
# Linux/Mac
unset SKIP_AUTH

# Windows (PowerShell)
Remove-Item Env:SKIP_AUTH

# Windows (CMD)
set SKIP_AUTH=
```

**方法2**: 设置为 false
```bash
export SKIP_AUTH=false
```

**方法3**: 在 Zeabur 控制台删除或修改环境变量后重新部署

### 清理测试数据（可选）

```sql
-- 删除虚拟用户的测试数据
DELETE FROM user_words WHERE user_id = 999999;
DELETE FROM review_records WHERE user_id = 999999;
DELETE FROM users WHERE user_id = 999999;
```

### 删除此文件

```bash
rm DEV_MODE_NOTES.md
```

---

## 📌 快速开关认证

如果需要频繁切换，可以使用环境变量：

### 前端（可选）

```env
# .env.local
VITE_SKIP_AUTH=true
```

然后修改代码：

```typescript
const SKIP_AUTH = import.meta.env.VITE_SKIP_AUTH === 'true';

if (!SKIP_AUTH && !token) {
  return redirect('/login');
}
```

### 后端

```bash
# 启用开发模式
export SKIP_AUTH=true

# 禁用开发模式（恢复认证）
export SKIP_AUTH=false
```

---

**文档生成时间**：2025-02-01
**状态**：开发模式（前后端都已跳过认证）
