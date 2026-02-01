"""
视觉服务 - 使用 OpenRouter Qwen 2.5 VL
无需本地模型，直接调用云端 API（在中国可访问）
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, Depends, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any
import base64
import os
import json
from datetime import datetime

from openai import AsyncOpenAI
import httpx

from shared.database.database import get_async_db
from shared.utils.response import success_response
from shared.utils.rate_limit import limit_expensive

# 初始化 FastAPI 应用
app = FastAPI(
    title="Vision Service (OpenRouter Qwen 2.5 VL)",
    description="视觉服务 - 直接调用 OpenRouter Qwen 2.5 VL（在中国可访问）",
    version="2.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",  # 开发环境
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 AsyncOpenAI 客户端（使用 OpenRouter）
api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    raise ValueError("OPENROUTER_API_KEY environment variable is required")

# 创建自定义异步 HTTP 客户端，设置更长的超时时间
http_client = httpx.AsyncClient(
    timeout=httpx.Timeout(90.0, connect=10.0),  # 总超时 90 秒，连接超时 10 秒
    limits=httpx.Limits(max_keepalive_connections=5, max_connections=10),
)

client = AsyncOpenAI(
    api_key=api_key,
    base_url="https://openrouter.ai/api/v1",
    http_client=http_client,
)


@app.get("/", tags=["Health"])
async def root():
    """健康检查"""
    return success_response(data={
        "message": "Vision Service is running (OpenRouter Qwen 2.5 VL)",
        "service": "vision",
        "provider": "OpenRouter",
        "model": "qwen/qwen-2.5-vl-7b-instruct"
    })


@app.post("/photo/recognize", tags=["Vision"])
@limit_expensive(max_requests=30, window_seconds=60)
async def recognize_photo(file: UploadFile = UploadFile(...)):
    """
    拍照识别单词（使用 OpenRouter 多模型支持）

    - **file**: 上传的图片文件

    返回：
    - 识别出的单词列表
    - 场景描述（英文句子）
    - 场景翻译（中文翻译）

    限流：每个用户/IP 每分钟最多 30 次

    模型优先级（按顺序尝试）：
    1. qwen/qwen-2-vl-7b-instruct（优先：Qwen 2 VL 7B，快速、便宜、够用）
    2. qwen/qwen-vl-max-latest（备选：Qwen VL Max，平衡性能）
    3. qwen/qwen-2-vl-72b-instruct（保底：Qwen 2 VL 72B，高质量）

    注：OpenAI/Anthropic/Google 模型在中国大陆被屏蔽，故使用这些可访问的替代方案
    """
    import logging
    import time
    logger = logging.getLogger(__name__)

    # 定义模型列表（按优先级排序）- 使用 OpenRouter 上可用的视觉模型
    # 更新：OpenRouter 现在提供 Qwen 2.5 VL 系列（2025年1月发布）
    MODELS = [
        "qwen/qwen-2.5-vl-7b-instruct",      # 优先：Qwen 2.5 VL 7B（快速、免费、够用）
        "qwen/qwen-2.5-vl-72b-instruct",     # 备选：Qwen 2.5 VL 72B（高质量）
    ]

    try:
        # 读取图片数据
        image_data = await file.read()
        request_start_time = time.time()
        logger.info(f"📸 收到图片识别请求，大小: {len(image_data)} 字节")

        # 转换为 base64
        base64_image = base64.b64encode(image_data).decode('utf-8')

        # 尝试多个模型，直到成功
        last_error = None
        successful_model = None
        model_start_time = time.time()

        for idx, model in enumerate(MODELS):
            try:
                logger.info(f"🔄 [{idx+1}/{len(MODELS)}] 尝试使用模型: {model}")
                call_start_time = time.time()

                response = await client.chat.completions.create(
                    model=model,
                    messages=[{
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """
分析这张图片，返回 JSON 格式：

{
  "objects": [
    {
      "word": "英文名称",
      "chinese": "中文释义",
      "phonetic": "音标（可选）",
      "position": 0
    }
  ],
  "scene_description": "适合英语学习的英文场景描述句",
  "scene_translation": "英文句子的中文翻译"
}

要求：
1. 只识别与场景主要相关的重要物体（3-8个）
2. 单词要是场景中的核心物体
3. 英文句子要简单、自然、地道（10-15个单词）
4. 中文翻译要准确、自然
5. 适合英语学习者使用

例如：如果图片显示孩子们在玩积木，返回：
{
  "objects": [
    {"word": "child", "chinese": "孩子", "position": 0},
    {"word": "table", "chinese": "桌子", "position": 1},
    {"word": "block", "chinese": "积木", "position": 2}
  ],
  "scene_description": "Children are sitting at a table playing with wooden blocks.",
  "scene_translation": "孩子们坐在桌子旁玩木制积木。"
}
                                """
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }],
                    response_format={"type": "json_object"},
                    max_tokens=500
                )

                # 成功获取响应，跳出循环
                call_duration = time.time() - call_start_time
                successful_model = model
                logger.info(f"✅ 模型 {model} 调用成功，耗时: {call_duration:.2f}秒")
                break

            except Exception as e:
                # 记录错误，尝试下一个模型
                last_error = e
                call_duration = time.time() - call_start_time
                logger.warning(f"❌ 模型 {model} 调用失败 ({call_duration:.2f}秒): {str(e)[:100]}")
                continue

        # 如果所有模型都失败，抛出最后一个错误
        if last_error is not None and 'response' not in locals():
            raise last_error

        # 解析响应
        result_text = response.choices[0].message.content
        result = json.loads(result_text)

        # 计算总耗时
        total_duration = time.time() - request_start_time

        logger.info(f"✨ 识别成功 | 模型: {successful_model} | 物体: {len(result.get('objects', []))} 个 | 总耗时: {total_duration:.2f}秒")
        logger.info(f"   场景描述: {result.get('scene_description', '')[:60]}...")
        logger.info(f"   场景翻译: {result.get('scene_translation', '')[:60]}...")

        # 构造返回数据
        words = []
        for idx, obj in enumerate(result.get('objects', [])):
            words.append({
                "id": f"word-{idx}",
                "word": obj.get('word', ''),
                "phonetic": obj.get('phonetic', ''),
                "definition": obj.get('chinese', ''),
                "pronunciationUrl": "",
                "isSaved": False,
                "positionInSentence": idx
            })

        return success_response(data={
            "photo": {
                "id": f"photo-{datetime.now().timestamp()}",
                "userId": "anonymous",
                "imageUrl": f"data:{file.content_type};base64,{base64_image}",
                "thumbnailUrl": f"data:{file.content_type};base64,{base64_image}",
                "capturedAt": datetime.now().isoformat(),
                "location": "识别成功",
                "status": "completed"
            },
            "words": words,
            "sceneDescription": result.get('scene_description', ''),
            "sceneTranslation": result.get('scene_translation', '')
        })

    except json.JSONDecodeError as e:
        logger.error(f"解析 API 响应失败: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"解析识别结果失败: {str(e)}"
        )
    except Exception as e:
        logger.error(f"图片识别失败: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"图片识别失败: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
