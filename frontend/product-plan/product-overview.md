# PhotoEnglish — Product Overview

## Summary

PhotoEnglish 是一款面向英语爱好者的移动端学习应用，通过拍照识别技术从英文阅读材料中快速提取生词，并提供语境化练习和间隔重复复习系统，帮助用户从"认识单词"进阶到"会用单词"。

## Planned Sections

1. **Foundation** — 用户认证、应用导航、设计系统等基础架构
2. **Photo Capture** — 拍照识别、OCR 文字提取、生词释义显示与保存，以及根据拍照场景生成英语描述句子
3. **Vocabulary Library** — 生词列表展示、搜索过滤、标签管理、单词详情查看
4. **Practice & Review** — AI 生成练习句子、填空与翻译训练、间隔重复默写复习系统
5. **Progress Dashboard** — 学习数据可视化、生词统计、练习正确率、复习进度追踪

## Data Model

**核心实体：**
- User — 使用应用的学习者，拥有自己的照片、生词库、练习记录和学习统计数据
- Photo — 用户拍摄的照片记录，包含原始图片、OCR 识别出的单词列表、以及 AI 基于场景生成的英语描述句子
- Word — 从照片中提取的英文生词，包含单词拼写、中文释义、音标、例句等词典信息
- Tag — 用户创建的标签，用于对生词进行分类管理（如"工作词汇"、"考试必备"）
- Practice — 用户的练习记录，包括单词练习（填空/翻译）和场景句子练习，记录题目、用户答案和正确性
- Review — 基于间隔重复算法的复习记录，跟踪每个单词的默写结果和下次复习时间
- Progress — 学习统计数据，包括生词总数、练习正确率、复习次数、学习天数等指标

**关键关系：**
- User has many Photos
- Photo has many Words（通过 OCR 识别）
- Photo has one Scene Description（AI 生成的场景句子）
- User has many Words（保存到个人生词库）
- Word has many Tags
- User has many Practices
- User has many Reviews
- Word has many Reviews
- User has one Progress

## Design System

**Colors:**
- Primary: indigo — 用于按钮、链接、核心操作
- Secondary: lime — 用于标签、进度提示、成功状态
- Neutral: slate — 用于背景、文本、边框

**Typography:**
- Heading: DM Sans
- Body: Inter
- Mono: IBM Plex Mono

## Implementation Sequence

按里程碑顺序构建此产品：

1. **Foundation** — 设置设计令牌、数据模型类型和应用程序外壳
2. **Photo Capture** — 拍照识别和生词提取功能
3. **Vocabulary Library** — 生词库管理功能
4. **Practice & Review** — 练习和复习系统
5. **Progress Dashboard** — 学习统计和数据可视化

每个里程碑在 `product-plan/instructions/` 中都有专门的指令文档。
