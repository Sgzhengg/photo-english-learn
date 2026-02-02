# PhotoEnglish — 完整实现说明

---

## 关于这些说明

**您收到的内容：**
- ✅ 完整的 UI 设计（带完整样式的 React 组件）
- ✅ 数据模型定义（TypeScript 类型和示例数据）
- ✅ UI/UX 规范（用户流程、需求）
- ✅ 设计系统令牌（颜色、字体、间距）
- ✅ 每个章节的测试编写说明（用于 TDD）

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
- ⚠️ **应该**在不存在记录时实现空状态
- ⚠️ **应该**使用测试驱动开发 — 首先使用 `tests.md` 说明编写测试

---

## 测试驱动开发

每个章节都包含一个 `tests.md` 文件，其中包含详细的测试编写说明。这些是**与框架无关的** — 适应到您的测试设置（Jest、Vitest、Playwright、Cypress 等）。

**对于每个章节：**
1. 阅读 `product-plan/sections/[section-id]/tests.md`
2. 为关键用户流程编写失败的测试（成功和失败路径）
3. 实现功能使测试通过
4. 保持测试绿色进行重构

测试说明包括：
- 要验证的具体 UI 元素、按钮标签、交互
- 预期的成功和失败行为
- 不存在记录时的空状态处理（首次用户、删除后）
- 数据断言和状态验证

---

# 产品概述

请先阅读 `product-plan/product-overview.md` 了解完整的产品定义。

PhotoEnglish 是一款面向英语爱好者的移动端学习应用，通过拍照识别技术从英文阅读材料中快速提取生词，并提供语境化练习和间隔重复复习系统。

**规划章节：**
1. **Foundation** — 用户认证、应用导航、设计系统
2. **Photo Capture** — 拍照识别、生词提取
3. **Vocabulary Library** — 生词库管理
4. **Practice & Review** — 练习和复习系统
5. **Progress Dashboard** — 学习数据可视化

---

# Milestone 1: Foundation

设置基础元素：设计令牌、数据模型类型、路由结构和应用外壳。

## 设计令牌

**查看 `product-plan/design-system/`：**
- `tokens.css` — CSS 自定义属性
- `tailwind-colors.md` — Tailwind 颜色配置
- `fonts.md` — Google Fonts 设置

**颜色：** Primary=indigo, Secondary=lime, Neutral=slate
**字体：** Heading=DM Sans, Body=Inter, Mono=IBM Plex Mono

## 数据模型

**查看 `product-plan/data-model/types.ts`** 获取所有实体接口定义。

核心实体：User, Photo, Word, Tag, Practice, Review, Progress

## 路由结构

创建所有章节的路由：
```
/login → /register → /onboarding → /photo-capture
/vocabulary → /practice → /progress
```

## 应用外壳

从 `product-plan/shell/components/` 复制组件：
- `AppShell.tsx` — 主布局
- `MainNav.tsx` — 底部导航（4个标签）
- `UserMenu.tsx` — 用户菜单

## 用户认证

从 `product-plan/sections/foundation/components/` 复制组件：
- `LoginPage.tsx` — 邮箱/手机号登录
- `RegisterPage.tsx` — 验证码注册
- `OnboardingPage.tsx` — 4步引导流程

**API 端点：**
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/send-code
PATCH /api/user/preferences
```

---

# Milestone 2: Photo Capture

实现拍照识别功能。

## 组件

从 `product-plan/sections/photo-capture/components/` 复制：
- `PhotoCaptureResult.tsx`
- `WordCard.tsx`
- `SceneSentence.tsx`

## 功能

- 拍照/选择图片
- OCR 识别单词
- 保存单词到生词库
- 播放场景句子 TTS
- 单词同步高亮

## API 端点

```
POST /api/photo/capture
POST /api/word/save
GET  /api/word/:id/audio
POST /api/photo/:id/scene-audio
```

---

# Milestone 3: Vocabulary Library

实现生词库功能。

## 组件

从 `product-plan/sections/vocabulary-library/components/` 复制：
- `VocabularyList.tsx`
- `WordDetail.tsx`

## 功能

- 列表/网格视图切换
- 搜索和过滤
- 标签管理
- 查看单词详情
- 删除单词

## API 端点

```
GET    /api/words
GET    /api/words?search=keyword
GET    /api/word/:id
DELETE /api/word/:id
```

---

# Milestone 4: Practice & Review

实现练习和复习系统。

## 组件

从 `product-plan/sections/practice-review/components/` 复制全部 6 个组件：
- DailyTaskHome.tsx
- PracticeQuestionView.tsx
- PracticeResultSummary.tsx
- ReviewSchedule.tsx
- WrongAnswersReview.tsx
- ProgressStats.tsx

## 功能

- 三种题型（填空/选择/听写）
- 错题复习
- 间隔重复算法
- 复习日程

## API 端点

```
GET  /api/practice/daily
POST /api/practice/submit
GET  /api/practice/wrong
GET  /api/review/schedule
POST /api/review/submit
```

---

# Milestone 5: Progress Dashboard

实现进度统计功能。

## 组件

从 `product-plan/sections/progress-dashboard/components/` 复制：
- `ProgressDashboard.tsx`

**注意：** 需要集成图表库（recharts、chart.js 等）

## 功能

- 学习概览统计
- 活动趋势图表
- 掌握程度分布
- 成就徽章系统

## API 端点

```
GET /api/progress/summary
GET /api/progress/activity
GET /api/progress/mastery
GET /api/progress/achievements
```

---

## 参考文件

所有章节都有：
- `README.md` — 功能概述
- `tests.md` — 测试说明
- `components/` — React 组件
- `types.ts` — TypeScript 接口
- `sample-data.json` — 示例数据

查看 `product-plan/design-system/` 获取设计令牌。
查看 `product-plan/data-model/` 获取数据模型。
查看 `product-plan/shell/` 获取应用外壳。
