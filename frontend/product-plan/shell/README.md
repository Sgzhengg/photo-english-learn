# Application Shell Specification

## Overview
移动端应用壳，采用底部标签栏导航模式，提供核心功能的快速切换和用户菜单访问。

## Navigation Structure
底部标签栏包含 4 个主导航项：
- **拍照识别** → Photo Capture（中央大按钮，突出显示）
- **生词库** → Vocabulary Library
- **练习** → Practice & Review
- **统计** → Progress Dashboard

## User Menu
用户菜单位置：顶部右侧
- 用户头像（圆形，点击展开菜单）
- 下拉菜单包含：
  - 用户名显示
  - 设置入口
  - 登出按钮

## Layout Pattern
底部标签栏导航 + 顶部标题栏 + 用户菜单

**顶部标题栏：**
- 左侧：应用名称 "PhotoEnglish"
- 右侧：用户头像
- 高度：56px（标准移动端顶部栏）

**底部标签栏：**
- 4 个导航项，固定底部
- 拍照识别按钮：较大尺寸，使用主色调 indigo，突出显示
- 其他按钮：标准尺寸，中性状态用 slate，激活状态用 indigo
- 高度：64px（包含安全区域）
- 图标 + 文字标签组合

## Responsive Behavior
- **Mobile（< 768px）：** 底部标签栏固定，全屏内容区域
- **Tablet（768px - 1024px）：** 保持底部标签栏，增加按钮间距
- **Desktop（> 1024px）：** 可选：居中显示移动端样式（最大宽度 480px）

## Design Notes
- **颜色方案：**
  - 主色调：indigo（核心按钮、激活状态）
  - 强调色：lime（进度提示、成功状态）
  - 中性色：slate（背景、文本、边框）
- **字体：**
  - 标题：DM Sans
  - 正文：Inter
  - 单词显示：IBM Plex Mono
- **Light/Dark 模式：** 支持，使用 `dark:` 变体
- **图标：** 使用 lucide-react 图标库
- **安全区域：** 考虑移动端安全区域（刘海屏、底部指示器）
