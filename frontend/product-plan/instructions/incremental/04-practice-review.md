# Milestone 4: Practice & Review (练习和复习)

> **配合使用：** `product-plan/product-overview.md`
> **前置条件：** Milestone 1-3 完成

---

## 目标

实现练习和复习系统 — 多种练习类型、间隔重复算法、进度追踪。

---

## 概述

练习和复习系统帮助用户巩固单词记忆。提供填空、选择、听写三种题型，基于间隔重复算法安排复习。

**核心功能：**
- 每日练习任务
- 三种题型（填空/选择/听写）
- 错题复习
- 间隔重复复习日程
- 学习进度统计

---

## 要实现的内容

### 组件

从 `product-plan/sections/practice-review/components/` 复制所有 6 个组件。

### API 端点

```
GET    /api/practice/daily          # 获取今日练习
GET    /api/practice/question/:id   # 获取练习题目
POST   /api/practice/submit         # 提交答案
GET    /api/practice/wrong          # 获取错题列表
GET    /api/review/schedule         # 获取复习日程
POST   /api/review/submit           # 提交复习结果
```

---

## 完成标志

- [ ] 练习流程完整
- [ ] 三种题型工作
- [ ] 错题复习功能
- [ ] 结果统计准确
- [ ] 移动端响应式
