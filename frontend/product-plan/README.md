# PhotoEnglish — Design Handoff

此文件夹包含实现 PhotoEnglish 所需的全部内容。

## 包含内容

**现成的提示词:**
- `prompts/one-shot-prompt.md` — 完整实现的提示词
- `prompts/section-prompt.md` — 章节实现的提示词模板

**说明文档:**
- `product-overview.md` — 产品概述（实现时务必提供）
- `instructions/` — 实现说明文档

**设计资源:**
- `design-system/` — 颜色、字体、设计令牌
- `data-model/` — 核心实体和 TypeScript 类型
- `shell/` — 应用外壳组件
- `sections/` — 所有章节的组件、类型、示例数据和测试说明

## 如何使用

### 选项 A：渐进式（推荐）

1. 复制 `product-plan/` 文件夹到您的代码库
2. 从 Foundation 开始（基础设置、数据模型、路由、外壳）
3. 逐个实现各个章节
4. 每个里程碑后进行审查和测试

### 选项 B：一次性实现

1. 复制 `product-plan/` 文件夹到您的代码库
2. 打开 `prompts/one-shot-prompt.md`
3. 复制粘贴到您的编程 agent
4. 回答 agent 的问题并实现所有内容

## 测试驱动开发

每个章节都包含 `tests.md` 文件，提供详细的测试说明。这些说明**与框架无关** — 可以适应到您的测试设置（Jest、Vitest、Playwright、Cypress 等）。

---

*由 Design OS 生成*
