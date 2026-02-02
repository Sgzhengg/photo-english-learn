# 🔧 路由问题已修复！

## 问题原因

访问 `http://localhost:5173/photo-capture` 出现 404，是因为：
- **错误路径**：`/photo-capture`
- **正确路径**：`/app/photo-capture`

所有应用页面都在 `/app` 路径下（使用 AppShell 包裹）。

---

## ✅ 已添加的修复

### 便捷重定向
现在以下路径会自动重定向到正确的位置：

| 访问路径 | 自动重定向到 |
|---------|-------------|
| `/photo-capture` | `/app/photo-capture` ✅ |
| `/vocabulary` | `/app/vocabulary` ✅ |
| `/practice` | `/app/practice` ✅ |
| `/progress` | `/app/progress` ✅ |

---

## 🎯 正确的路径结构

### 认证页面（无外壳）
```
/login          → 登录页面
/register        → 注册页面
/forgot-password → 忘记密码
/onboarding      → 引导页面
```

### 应用页面（带导航栏）
```
/app/photo-capture → 拍照识别
/app/vocabulary    → 生词库
/app/practice      → 练习
/app/progress      → 统计
```

---

## 📱 如何访问应用

### 方式 1：通过首页自动跳转 ✅
```
访问：http://localhost:5173/

如果已登录 → 自动跳转到 /app/photo-capture
如果未登录 → 自动跳转到 /login
```

### 方式 2：直接访问应用页面 ✅
```
完整路径：
http://localhost:5173/app/photo-capture
http://localhost:5173/app/vocabulary
http://localhost:5173/app/practice
http://localhost:5173/app/progress
```

### 方式 3：使用便捷路径（自动重定向）✅
```
短路径（自动重定向到完整路径）：
http://localhost:5173/photo-capture  → /app/photo-capture
http://localhost:5173/vocabulary     → /app/vocabulary
http://localhost:5173/practice       → /app/practice
http://localhost:5173/progress       → /app/progress
```

---

## 🧪 完整测试流程

### 1. 注册新账号
```
访问：http://localhost:5173/register

填写表单：
- 邮箱：test@example.com
- 验证码：123456
- 密码：password123
- ✅ 同意协议

点击"注册" → ✅ 自动跳转到引导页面
```

### 2. 完成引导流程
```
引导页面（4页）：
1. 欢迎页 → 点击"下一步"
2. 拍照识别介绍 → 点击"下一步"
3. 生词库练习介绍 → 点击"下一步"
4. 选择偏好：
   - 英语水平：Intermediate
   - 每日目标：20 words
   - 点击"开始使用"

✅ 跳转到主应用（/app/photo-capture）
```

### 3. 测试导航
```
在主应用中：

底部导航栏：
- 点击 📸 → 拍照识别页面
- 点击 📚 → 生词库页面（占位）
- 点击 ✍️ → 练习页面（占位）
- 点击 📊 → 统计页面（占位）

用户菜单：
- 点击右上角头像
- 点击"登出" → 返回登录页面
```

### 4. 重新登录
```
访问：http://localhost:5173/login

输入：
- 邮箱：test@example.com
- 密码：password123

点击"登录" → ✅ 直接进入主应用
（不再显示引导页面，因为已完成）
```

---

## 🎨 应用布局说明

### 认证页面
```
┌─────────────────────────────┐
│      [Logo] PhotoEnglish     │
│                             │
│     ┌─────────────────┐     │
│     │                 │     │
│     │  登录/注册表单   │     │
│     │                 │     │
│     └─────────────────┘     │
│                             │
│     版权信息                 │
└─────────────────────────────┘
```

### 应用页面（带导航栏）
```
┌─────────────────────────────┐
│  PhotoEnglish    [头像]     │ ← 顶部栏
├─────────────────────────────┤
│                             │
│                             │
│       主内容区域             │
│     (拍照/生词库/练习)       │
│                             │
│                             │
├─────────────────────────────┤
│ 📸  📚  ✍️  📊             │ ← 底部导航
└─────────────────────────────┘
```

---

## 🔍 调试技巧

### 查看当前路由
打开浏览器控制台（F12），输入：
```javascript
window.location.pathname
```

### 查看登录状态
```javascript
localStorage.getItem('access_token')
// 如果返回 token 字符串，说明已登录
```

### 查看用户信息
```javascript
JSON.parse(localStorage.getItem('photoenglish_mock_current_user'))
```

---

## ⚠️ 常见问题

### Q: 为什么应用路径都在 `/app` 下？
A: 这样设计是为了：
- 统一使用 AppShell（顶部栏 + 底部导航）
- 区分认证页面和应用页面
- 方便后续添加权限控制

### Q: 可以直接访问 `/photo-capture` 吗？
A: 现在可以了！已添加自动重定向 ✅

### Q: 端口是 3000 还是 5173？
A: Vite 默认使用 **5173** 端口：
```
http://localhost:5173/
```

如果使用其他端口，请查看启动时的提示信息。

---

## 🚀 下一步

现在一切应该正常工作了！你可以：

1. ✅ **测试完整认证流程**
2. ✅ **测试引导流程**
3. ✅ **测试应用导航**
4. 📸 **准备实现 Milestone 2 - Photo Capture**

还有其他问题吗？或者准备继续实现下一个功能？
