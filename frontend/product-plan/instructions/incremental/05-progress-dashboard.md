# Milestone 5: Progress Dashboard (进度统计)

> **配合使用：** `product-plan/product-overview.md`
> **前置条件：** Milestone 1-4 完成

---

## 目标

实现进度统计功能 — 数据可视化、学习统计、成就系统。

---

## 概述

进度统计页面帮助用户了解学习进展。通过直观的图表和统计数据展示学习成果。

**核心功能：**
- 学习概览（今日/本周/本月统计）
- 学习活动趋势图
- 掌握程度分布图
- 正确率曲线
- 成就徽章系统

---

## 要实现的内容

### 组件

从 `product-plan/sections/progress-dashboard/components/` 复制：

- `ProgressDashboard.tsx` — 统计面板组件

**注意：** 您需要选择并集成图表库（如 recharts、chart.js 等）来实现数据可视化。

### API 端点

```
GET    /api/progress/summary        # 获取学习概览
GET    /api/progress/activity       # 获取学习活动数据
GET    /api/progress/mastery        # 获取掌握程度分布
GET    /api/progress/achievements   # 获取成就列表
```

---

## 完成标志

- [ ] 所有统计数据正确显示
- [ ] 图表渲染正确
- [ ] 成就系统工作
- [ ] 数据刷新功能
- [ ] 移动端响应式
