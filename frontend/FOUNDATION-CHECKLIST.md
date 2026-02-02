# Milestone 1: Foundation - 实现完成清单

## ✅ 已完成的工作

### 1. 设计系统设置
- ✅ 添加 Google Fonts (DM Sans, Inter, IBM Plex Mono)
- ✅ 更新页面标题为 "PhotoEnglish"
- ✅ Tailwind CSS 配置（使用内置颜色）

### 2. 核心类型定义
- ✅ 创建全局数据模型 (`src/types/index.ts`)
  - User（用户）
  - Photo（照片）
  - Word（单词）
  - Tag（标签）
  - Practice（练习）
  - Review（复习）
  - Progress（进度统计）

### 3. API 服务层
- ✅ 创建 API 客户端 (`src/lib/api.ts`)
  - 自动 Token 刷新机制
  - 统一错误处理
  - API 端点定义：
    - `/api/auth/*` - 认证相关
    - `/api/user/*` - 用户管理
    - `/api/photo/*` - 拍照识别
    - `/api/vocabulary/*` - 生词库
    - `/api/practice/*` - 练习
    - `/api/review/*` - 复习
    - `/api/progress/*` - 进度统计

### 4. 认证系统
- ✅ 创建 AuthContext (`src/contexts/AuthContext.tsx`)
  - 登录/注册/登出功能
  - Token 管理（localStorage）
  - 自动检查认证状态
  - 提供 useAuth Hook

### 5. 路由配置
- ✅ 创建路由结构 (`src/lib/router-config.tsx`)
  - 公开路由：`/login`, `/register`, `/forgot-password`, `/onboarding`
  - 受保护路由：`/app/*` (需要认证)
  - 自动重定向逻辑
  - 404 页面

### 6. 认证页面
- ✅ 登录页面 (`src/components/auth/LoginPage.tsx`)
- ✅ 注册页面 (`src/components/auth/RegisterPage.tsx`)
- ✅ 忘记密码页面 (`src/components/auth/ForgotPasswordPage.tsx`)
- ✅ 引导页面 (`src/components/auth/OnboardingPage.tsx`)

### 7. 应用外壳
- ✅ 复制 Shell 组件 (`src/shell/components/`)
  - AppShell - 主布局容器
  - MainNav - 底部导航栏
  - UserMenu - 用户菜单
- ✅ 创建 AppShell 包装器 (`src/components/shell/AppShell.tsx`)

### 8. 占位页面（后续 Milestone）
- ✅ 拍照识别页面 (`src/components/photo-capture/PhotoCapturePage.tsx`)
- ✅ 生词库页面 (`src/components/vocabulary-library/VocabularyLibraryPage.tsx`)
- ✅ 练习复习页面 (`src/components/practice-review/PracticeReviewPage.tsx`)
- ✅ 进度统计页面 (`src/components/progress-dashboard/ProgressDashboardPage.tsx`)

---

## 🔧 配置信息

### API 配置
- **Base URL**: `https://photo-english-learn-api-gateway.zeabur.app:8080`
- **认证方式**: JWT Token (localStorage)
- **验证码**: 开发模式（任意 6 位数字）

### 路由结构
```
/ → 重定向到 /login 或 /app/photo-capture
/login → 登录页面
/register → 注册页面
/forgot-password → 重置密码页面
/onboarding → 引导页面（需要认证）

/app → 应用外壳（需要认证）
  /app/photo-capture → 拍照识别
  /app/vocabulary → 生词库
  /app/practice → 练习
  /app/progress → 统计
```

---

## 🧪 测试指南

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 测试认证流程

#### 测试登录
1. 访问 `http://localhost:5173`
2. 应该自动重定向到 `/login`
3. 输入邮箱/手机号和密码
4. 点击"登录"按钮
5. **预期**：
   - 如果未完成引导，跳转到 `/onboarding`
   - 如果已完成引导，跳转到 `/app/photo-capture`

#### 测试注册
1. 在登录页面点击"立即注册"
2. 输入邮箱/手机号
3. 点击"发送验证码"（开发模式：任意 6 位数字）
4. 输入验证码、密码和确认密码
5. 勾选用户协议
6. 点击"注册"
7. **预期**：注册成功后跳转到 `/onboarding`

#### 测试忘记密码
1. 在登录页面点击"忘记密码？"
2. 输入注册邮箱/手机号
3. 点击"发送验证码"
4. 输入新密码
5. **预期**：重置成功后返回登录页面

#### 测试引导流程
1. 完成注册或首次登录后进入引导页面
2. 滑动查看功能介绍（3页）
3. 在第4页选择英语水平和每日学习目标
4. 点击"开始使用"
5. **预期**：跳转到主应用 (`/app/photo-capture`)

#### 测试应用导航
1. 在主应用中点击底部导航栏
2. 测试各个导航项：
   - 📸 拍照识别
   - 📚 生词库
   - ✍️ 练习
   - 📊 统计
3. 点击右上角用户头像
4. **预期**：显示用户菜单，包含登出按钮

#### 测试登出
1. 在用户菜单中点击"登出"
2. **预期**：清除登录状态，重定向到 `/login`

---

## 📝 后端 API 依赖

### 必需的 API 端点（Foundation）

#### 认证相关
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/send-code` - 发送验证码
- `POST /api/auth/refresh` - 刷新 Token
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/reset-password` - 重置密码
- `POST /api/auth/logout` - 登出

#### 用户相关
- `PATCH /api/user/preferences` - 更新用户偏好（引导页）

### 请求/响应格式

#### 登录请求
```json
POST /api/auth/login
{
  "emailOrPhone": "user@example.com",
  "password": "password123",
  "keepLoggedIn": true
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresAt": 1234567890,
    "user": {
      "id": "user-123",
      "username": "johndoe",
      "email": "user@example.com",
      "nickname": "John",
      "hasCompletedOnboarding": false,
      ...
    }
  }
}
```

#### 注册请求
```json
POST /api/auth/register
{
  "emailOrPhone": "user@example.com",
  "verificationCode": "123456",
  "password": "password123"
}
```

#### 更新偏好（引导页）
```json
PATCH /api/user/preferences
{
  "englishLevel": "intermediate",
  "dailyGoal": "20"
}
```

---

## 🐛 已知问题和限制

### 开发模式限制
1. **验证码**：当前接受任意 6 位数字（生产环境需要真实验证码服务）
2. **密码**：前端不加密，直接发送（依赖 HTTPS）
3. **Token**：存储在 localStorage（生产环境建议使用 httpOnly cookie）

### 占位页面
以下页面目前显示"Coming soon"占位符：
- 拍照识别页面（Milestone 2 实现）
- 生词库页面（Milestone 3 实现）
- 练习复习页面（Milestone 4 实现）
- 进度统计页面（Milestone 5 实现）

---

## 🚀 下一步：Milestone 2 - Photo Capture

### 实现内容
1. 相机取景器界面
2. 拍照功能
3. OCR 文字识别
4. 生词卡片展示
5. 场景句子生成
6. TTS 朗读功能
7. 单词保存到生词库

### 前置条件
- ✅ Foundation 完成
- ⏳ 后端 OCR API 准备就绪
- ⏳ 后端 AI 生成 API 准备就绪

---

## 📚 参考文档

- Product Overview: `product-plan/product-overview.md`
- Foundation Instructions: `product-plan/instructions/incremental/01-foundation.md`
- Foundation Types: `product-plan/sections/foundation/types.ts`
- Foundation Tests: `product-plan/sections/foundation/tests.md`
