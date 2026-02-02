# Milestone 2: Photo Capture (拍照识别)

> **配合使用：** `product-plan/product-overview.md`
> **前置条件：** Milestone 1 (Foundation) 完成

---

## 目标

实现拍照识别功能 — 用户拍照、AI 识别图片中的英文单词、保存到生词库、查看 AI 生成的场景描述句子。

---

## 概述

拍照识别是 PhotoEnglish 的核心功能。用户通过拍照快速提取英文阅读材料中的生词，查看释义并一键保存。系统还会基于图片场景生成英语描述句子，帮助用户在语境中学习词汇。

**核心功能：**
- 拍照并识别图片中的英文单词
- 显示识别结果（单词、音标、释义、发音）
- 一键保存单词到生词库
- 查看场景描述句子
- TTS 朗读场景句子，单词同步高亮

---

## 推荐方法：测试驱动开发

在实现之前，**首先基于测试规范编写测试**。

查看 `product-plan/sections/photo-capture/tests.md` 获取详细测试编写说明。

**TDD 工作流：**
1. 阅读 `tests.md` 并为关键用户流程编写失败的测试
2. 实现功能使测试通过
3. 保持测试绿色进行重构

---

## 要实现的内容

### 组件

从 `product-plan/sections/photo-capture/components/` 复制：

- `PhotoCaptureResult.tsx` — 识别结果主组件
- `WordCard.tsx` — 单词卡片组件
- `SceneSentence.tsx` — 场景句子组件

### 数据层

组件期望这些数据形状（查看 `types.ts`）：

```typescript
{
  currentPhoto: Photo | null
  isCapturing: boolean
  currentWordIndex: number
  isPlaying: boolean
  onCapture?: () => void
  onPlayWordPronunciation?: (wordId: string) => void
  onSaveWord?: (wordId: string) => void
  onUnsaveWord?: (wordId: string) => void
  onPlayScene?: (photoId: string) => void
  onPauseScene?: () => void
  onStopScene?: () => void
}
```

您需要：
- 创建 API 端点或数据获取逻辑
- 将真实数据连接到组件

### API 端点

```
POST   /api/photo/capture          # 上传照片并 OCR 识别
GET    /api/photo/:id             # 获取照片识别结果
POST   /api/word/save             # 保存单词到生词库
DELETE /api/word/:id              # 从生词库删除单词
GET    /api/word/:id/audio        # 获取单词发音
POST   /api/photo/:id/scene-audio # 获取场景句子 TTS
```

### 回调连接

| 回调 | 描述 |
|------|------|
| `onCapture` | 打开相机/选择图片，调用识别 API |
| `onPlayWordPronunciation` | 播放单词发音 TTS |
| `onSaveWord` | 保存单词到生词库（API 调用）|
| `onUnsaveWord` | 取消保存单词（API 调用）|
| `onPlayScene` | 播放场景句子 TTS |
| `onPauseScene` | 暂停播放 |
| `onStopScene` | 停止播放 |

### 空状态

当没有记录时实现空状态 UI：
- **未拍照：** 显示相机界面，引导用户拍照
- **识别失败：** 显示错误消息和"重新拍照"按钮
- **无识别结果：** 显示"未识别到英文单词"消息

---

## 要参考的文件

- `product-plan/sections/photo-capture/README.md` — 功能概述
- `product-plan/sections/photo-capture/tests.md` — 测试说明
- `product-plan/sections/photo-capture/components/` — React 组件
- `product-plan/sections/photo-capture/types.ts` — TypeScript 接口
- `product-plan/sections/photo-capture/sample-data.json` — 测试数据

---

## 预期用户流程

### 流程 1：拍照并保存单词

1. 用户点击底部导航中央的拍照按钮
2. 打开相机/文件选择器
3. 用户拍照/选择图片
4. 调用识别 API（模拟或真实）
5. 显示加载状态
6. 显示识别结果（单词列表）
7. 用户点击某个单词的"保存"按钮
8. 调用保存 API
9. 单词状态更新为"已保存"
10. 场景句子显示在页面下方

### 流程 2：播放场景句子

1. 用户点击场景句子的"播放"按钮
2. TTS 开始朗读英文句子
3. 当前读到的单词高亮显示
4. 播放完成后按钮恢复为"播放"

---

## 完成标志

- [ ] 为关键用户流程编写了测试
- [ ] 所有测试通过
- [ ] 组件使用真实数据渲染
- [ ] 空状态正确显示
- [ ] 所有用户操作工作
- [ ] 用户可以完成所有预期的端到端流程
- [ ] 符合视觉设计
- [ ] 移动端响应式
