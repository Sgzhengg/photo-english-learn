# Milestone 3: Vocabulary Library (生词库)

> **配合使用：** `product-plan/product-overview.md`
> **前置条件：** Milestone 1 & 2 完成

---

## 目标

实现生词库功能 — 用户查看、搜索、过滤和管理所有保存的单词。

---

## 概述

生词库是用户管理所有学习单词的中心。支持列表和网格视图切换、搜索过滤、标签分类，以及查看单词详情。

**核心功能：**
- 查看所有保存的单词（列表/网格视图）
- 搜索单词（拼写或释义）
- 按标签过滤
- 查看单词详情（释义、例句、学习记录）
- 播放单词发音
- 删除单词

---

## 要实现的内容

### 组件

从 `product-plan/sections/vocabulary-library/components/` 复制：

- `VocabularyList.tsx` — 单词列表组件
- `WordDetail.tsx` — 单词详情组件

### API 端点

```
GET    /api/words                    # 获取所有单词
GET    /api/words?search=keyword     # 搜索单词
GET    /api/words?tags=tag1,tag2     # 按标签过滤
GET    /api/word/:id                # 获取单词详情
DELETE /api/word/:id                # 删除单词
GET    /api/tags                    # 获取所有标签
```

---

## 完成标志

- [ ] 测试通过
- [ ] 列表显示所有单词
- [ ] 搜索和过滤工作
- [ ] 详情页显示完整信息
- [ ] 移动端响应式
