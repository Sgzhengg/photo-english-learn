# OpenRouter 集成指南

本项目已集成 OpenRouter，支持多种视觉和文本大模型。

## 什么是 OpenRouter？

OpenRouter 是一个统一的 API 接口，可以访问多种大语言模型，包括：
- OpenAI (GPT-4, GPT-4o)
- Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)
- Google (Gemini Pro)
- Meta (Llama 3)
- Mistral AI
- 等更多模型

## 快速开始

### 1. 获取 API Key

访问 [OpenRouter](https://openrouter.ai/keys) 注册并获取 API Key。

### 2. 配置环境变量

在 `.env` 文件中添加：

```bash
# 必填
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# 可选：选择模型
VISION_MODEL=openai/gpt-4o
TEXT_MODEL=openai/gpt-4o

# 可选：应用信息
APP_NAME=Photo English Learn
APP_URL=https://github.com/yourusername/photo-english-learn
```

### 3. 支持的模型

#### 视觉模型 (用于图片理解)

| 模型 ID | 描述 | 价格 (输入/输出) |
|---------|------|------------------|
| `openai/gpt-4o` | 推荐，支持视觉 | $2.50/10.50 |
| `openai/gpt-4-vision-preview` | GPT-4 Vision | $10/30 |
| `anthropic/claude-3.5-sonnet` | Claude 3.5 Sonnet | $3/15 |
| `anthropic/claude-3-opus` | Claude 3 Opus | $15/75 |
| `google/gemini-pro-vision` | Gemini Pro Vision | - |

#### 文本模型 (用于生成短句)

| 模型 ID | 描述 | 价格 |
|---------|------|------|
| `openai/gpt-4o` | 推荐 | $2.50/10.50 |
| `openai/gpt-4-turbo` | GPT-4 Turbo | $10/30 |
| `anthropic/claude-3.5-sonnet` | 推荐 | $3/15 |
| `meta-llama/llama-3-70b-instruct` | Llama 3 70B | **免费** |
| `mistralai/mistral-7b-instruct` | Mistral 7B | **免费** |

最新价格请参考 [OpenRouter 定价](https://openrouter.ai/models)

## 配置示例

### 使用 GPT-4o (推荐)

```bash
VISION_MODEL=openai/gpt-4o
TEXT_MODEL=openai/gpt-4o
```

### 使用 Claude 3.5 Sonnet (推荐)

```bash
VISION_MODEL=anthropic/claude-3.5-sonnet
TEXT_MODEL=anthropic/claude-3.5-sonnet
```

### 使用免费模型

```bash
VISION_MODEL=openai/gpt-4o  # 视觉需要付费
TEXT_MODEL=meta-llama/llama-3-70b-instruct  # 文本生成免费
```

## 使用说明

### 代码中使用

```python
from shared.vision.scene_understanding import SceneUnderstanding

# 自动使用 OPENROUTER_API_KEY
scene_understanding = SceneUnderstanding()

# 生成场景描述
description = scene_understanding.generate_description(
    image_data=image_bytes,
    detections=detected_objects,
    language="zh"
)

# 生成短句
sentence = scene_understanding.generate_sentence(
    scene_description=description,
    objects=["cup", "laptop"],
    difficulty="beginner"
)
```

### 异步使用

```python
from shared.vision.scene_understanding import AsyncSceneUnderstanding

scene_understanding = AsyncSceneUnderstanding()

description = await scene_understanding.generate_description_async(...)
sentence = await scene_understanding.generate_sentence_async(...)
```

## OpenRouter 优势

1. **统一接口**: 一个 API Key 访问多种模型
2. **价格透明**: 实时价格比较，选择最优模型
3. **模型切换**: 轻松切换不同模型，无需修改代码
4. **免费模型**: 支持 Llama、Mistral 等开源模型
5. **高可用性**: 自动故障转移

## 故障排除

### API 密钥无效

确保环境变量 `OPENROUTER_API_KEY` 已正确设置：

```bash
echo $OPENROUTER_API_KEY
```

### 模型不可用

检查模型是否在 OpenRouter 上可用：https://openrouter.ai/models

### 查看使用情况

访问 OpenRouter Dashboard 查看使用统计和账单：https://openrouter.ai/keys

## 相关链接

- [OpenRouter 官网](https://openrouter.ai)
- [OpenRouter 文档](https://openrouter.ai/docs)
- [OpenRouter 模型列表](https://openrouter.ai/models)
- [OpenRouter 定价](https://openrouter.ai/models?order=newest)
