# PhotoEnglish 一次性实现提示词

我需要你实现一个完整的 PhotoEnglish 移动端学习应用。

## 项目概述

PhotoEnglish 是一款面向英语爱好者的移动端学习应用，通过拍照识别技术从英文阅读材料中快速提取生词，并提供语境化练习和间隔重复复习系统。

**关键特性：**
- 📸 智能拍照识别：批量提取英文单词，即时显示释义，快速勾选保存
- 📚 生词库管理：标签化整理，搜索过滤，随时查看
- ✍️ 语境练习：AI 生成包含生词的练习句子，填空/翻译训练
- 🔄 间隔复习：默写模式检测记忆效果，自动调整复习频率
- 📊 学习统计：生词数量、练习正确率、复习进度一目了然
- 🔊 TTS 发音：地道英语发音，边听边学

## 产品规划

应用分为 5 个主要章节：

1. **Foundation** - 用户认证、注册、引导流程
2. **Photo Capture** - 拍照识别、OCR 提取、生词保存
3. **Vocabulary Library** - 生词列表、搜索过滤、标签管理
4. **Practice & Review** - 多种练习类型、间隔重复复习
5. **Progress Dashboard** - 学习数据可视化、成就系统

## 设计系统

**颜色：**
- Primary: indigo（按钮、链接、核心操作）
- Secondary: lime（成功状态、进度提示）
- Neutral: slate（背景、文本、边框）

**字体：**
- 标题: DM Sans
- 正文: Inter
- 等宽/音标: IBM Plex Mono

**响应式：** 移动端优先，支持亮色/暗色模式

## 实现要求

### 你需要构建：

1. **完整的 React 前端应用**
   - 使用 React 19 + TypeScript + Vite
   - React Router 用于路由
   - Tailwind CSS v4 用于样式

2. **用户认证系统**
   - 邮箱/手机号登录
   - 注册（验证码验证）
   - 新用户引导流程
   - JWT Token 认证
   - 自动刷新 Token

3. **数据管理**
   - 全局状态管理（Context 或 Zustand）
   - API 数据获取层
   - 错误处理和加载状态
   - 空状态 UI

4. **所有 5 个功能章节**
   - 我已经提供了完整的 UI 组件
   - 你需要将它们连接到真实数据和 API
   - 实现所有的用户交互和数据流

5. **API 端点**（模拟或真实）
   - 用户认证：POST /api/auth/login, /api/auth/register
   - 单词管理：GET/POST/DELETE /api/words
   - 练习系统：GET/POST /api/practice
   - 学习统计：GET /api/progress
   - OCR 识别：POST /api/photo/recognize

## 重要：不要重新设计

- ✅ **使用提供的组件** - UI 组件已经完整设计好了
- ✅ **保持视觉一致性** - 颜色、字体、布局都不要改
- ✅ **连接数据和回调** - 你的工作是让组件"活"起来
- ❌ **不要重新设计界面** - 不要改变组件的视觉设计
- ❌ **不要添加新功能** - 实现规范中定义的功能即可

## 实现顺序

1. **Foundation** - 认证、路由、外壳
2. **Photo Capture** - 拍照、识别、保存
3. **Vocabulary Library** - 列表、搜索、详情
4. **Practice & Review** - 练习、复习
5. **Progress Dashboard** - 统计、图表

## 测试驱动开发

每个章节都有详细的 `tests.md` 文件：
- 先阅读测试说明
- 编写测试用例
- 实现功能让测试通过

## 我给你的文件

**必需文件（请先阅读这些）：**
- `product-plan/product-overview.md` - 产品总览
- `product-plan/design-system/` - 设计令牌
- `product-plan/data-model/` - 数据模型

**组件和类型：**
- `product-plan/shell/components/` - 应用外壳
- `product-plan/sections/foundation/` - 认证组件
- `product-plan/sections/photo-capture/` - 拍照组件
- `product-plan/sections/vocabulary-library/` - 生词库组件
- `product-plan/sections/practice-review/` - 练习组件
- `product-plan/sections/progress-dashboard/` - 统计组件

每个章节都包含：
- README.md - 功能说明
- types.ts - TypeScript 类型
- sample-data.json - 示例数据
- components/ - React 组件
- tests.md - 测试说明

## 在你开始之前，请问我：

1. **认证与授权**
   - 用户如何注册和登录？（邮箱/密码、OAuth、魔链？）
   - 有不同的用户角色和权限吗？
   - 需要管理后台吗？

2. **用户与账号建模**
   - 这是单用户应用还是多用户？
   - 用户属于组织/团队/工作空间吗？
   - 用户资料结构应该如何？

3. **技术栈偏好**
   - 后端框架/语言应该用什么？
   - 你偏好什么数据库？
   - 有特定的托管/部署要求吗？

4. **后端业务逻辑**
   - 除了 UI 显示的，还需要什么服务器端逻辑、验证或进程？
   - 需要触发的后台进程、通知或其他进程吗？

5. **其他澄清**
   - 关于特定功能或用户流程的问题
   - 需要澄清的边界情况
   - 集成需求

最后，询问我是否还有其他注意事项要添加到此实现中。

回答我的问题后，制定一个全面的实现计划，然后开始编码。
