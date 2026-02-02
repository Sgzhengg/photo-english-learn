# Milestone 1: Foundation (基础模块)

> **配合使用：** `product-plan/product-overview.md`
> **前置条件：** 无

---

## 关于这些说明

**您收到的内容：**
- ✅ 完整的 UI 设计（带完整样式的 React 组件）
- ✅ 数据模型定义（TypeScript 类型和示例数据）
- ✅ UI/UX 规范（用户流程、需求、截图）
- ✅ 设计系统令牌（颜色、字体、间距）
- ✅ 每个章节的测试编写说明（用于 TDD 方法）

**您需要构建的：**
- 🔌 后端 API 端点和数据库架构
- 🔐 认证和授权
- 📡 数据获取和状态管理
- 🧮 业务逻辑和验证
- 🔗 将提供的 UI 组件与真实数据集成

**重要指南：**
- ⚠️ **不要**重新设计或重新设计提供的组件 — 按原样使用
- ⚠️ **应该**将回调 props 连接到路由和 API 调用
- ⚠️ **应该**用后端的真实数据替换示例数据
- ⚠️ **应该**实现适当的错误处理和加载状态
- ⚠️ **应该**在不存在记录时实现空状态（首次用户、删除后）
- ⚠️ **应该**使用测试驱动开发 — 首先使用 `tests.md` 说明编写测试
- 组件是基于 props 的，已准备好集成 — 专注于后端和数据层

---

## 目标

设置基础元素：设计令牌、数据模型类型、路由结构和应用外壳。

---

## 要实现的内容

### 1. 设计令牌

配置您的样式系统：

**查看 `product-plan/design-system/tokens.css` 获取 CSS 自定义属性**

**查看 `product-plan/design-system/tailwind-colors.md` 获取 Tailwind 配置**

**查看 `product-plan/design-system/fonts.md` 获取 Google Fonts 设置**

**颜色：**
- Primary: indigo（用于按钮、链接、核心交互）
- Secondary: lime（用于标签、进度指示器、成功状态）
- Neutral: slate（用于背景、文本、边框）

**字体：**
- 标题: DM Sans
- 正文: Inter
- 等宽: IBM Plex Mono

### 2. 数据模型类型

创建 TypeScript 接口用于核心实体：

**查看 `product-plan/data-model/types.ts` 获取接口定义**

**查看 `product-plan/data-model/README.md` 获取实体关系**

**核心实体：**
- User（用户）
- Photo（照片）
- Word（单词）
- Tag（标签）
- Practice（练习）
- Review（复习）
- Progress（进度）

### 3. 路由结构

创建所有章节的占位路由：

```
/                      → 重定向到 /login 或 /photo-capture
/login                 → 登录页面
/register              → 注册页面
/onboarding            → 引导页面
/photo-capture         → 拍照识别（主页面）
/vocabulary            → 生词库
/practice              → 练习
/progress              → 统计
```

### 4. 应用外壳

从 `product-plan/shell/components/` 复制外壳组件到您的项目：

- `AppShell.tsx` — 主布局包装器
- `MainNav.tsx` — 导航组件
- `UserMenu.tsx` — 用户菜单与头像

**连接导航到路由：**

导航项：
1. **拍照识别** → `/photo-capture`（主要按钮）
2. **生词库** → `/vocabulary`
3. **练习** → `/practice`
4. **统计** → `/progress`

**用户菜单：**

用户菜单期望：
- 用户名
- 头像 URL（可选）
- 登出回调

### 5. 用户认证（Foundation 章节）

从 `product-plan/sections/foundation/components/` 复制组件：

- `LoginPage.tsx` — 登录页面
- `RegisterPage.tsx` — 注册页面
- `OnboardingPage.tsx` — 引导页面

**实现认证流程：**

1. **登录**
   - API: `POST /api/auth/login`
   - 请求体：`{ emailOrPhone, password, keepLoggedIn }`
   - 响应：`{ accessToken, refreshToken, user }`
   - 成功后：保存 token 到 localStorage/cookie，跳转到主页或引导页

2. **注册**
   - API: `POST /api/auth/register`
   - 请求体：`{ emailOrPhone, verificationCode, password, ... }`
   - API: `POST /api/auth/send-code`（发送验证码）
   - 成功后：自动登录并跳转到引导页

3. **引导**
   - 收集用户偏好（英语水平、每日目标）
   - API: `PATCH /api/user/preferences`
   - 完成后：设置 `hasCompletedOnboarding: true`，跳转到拍照页面

**数据持久化：**
- Access token：localStorage（用于 API 调用）
- Refresh token：httpOnly cookie（安全）
- 用户信息：React Context 或 Zustand store

---

## 要参考的文件

- `product-plan/design-system/` — 设计令牌
- `product-plan/data-model/` — 类型定义
- `product-plan/shell/README.md` — 外壳设计意图
- `product-plan/shell/components/` — 外壳 React 组件
- `product-plan/sections/foundation/README.md` — 认证规范
- `product-plan/sections/foundation/components/` — 认证组件
- `product-plan/sections/foundation/types.ts` — 认证类型
- `product-plan/sections/foundation/tests.md` — 测试说明

---

## 完成标志

- [ ] 设计令牌已配置
- [ ] 数据模型类型已定义
- [ ] 所有路由存在（可以是占位页面）
- [ ] 外壳使用导航渲染
- [ ] 导航链接到正确路由
- [ ] 用户菜单显示用户信息
- [ ] 登录功能工作（API 集成）
- [ ] 注册功能工作（API 集成）
- [ ] 引导流程工作（偏好设置保存）
- [ ] Token 刷新机制工作
- [ ] 移动端响应式
- [ ] 亮色/暗色模式支持
