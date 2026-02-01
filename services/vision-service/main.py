"""
视觉服务 - 使用 OpenRouter GPT-4o-mini
无需本地模型，直接调用云端 API
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
    title="Vision Service (OpenRouter GPT-4o-mini)",
    description="视觉服务 - 直接调用 OpenRouter GPT-4o-mini",
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
        "message": "Vision Service is running (OpenRouter GPT-4o-mini)",
        "service": "vision",
        "provider": "OpenRouter",
        "model": "openai/gpt-4o-mini"
    })


@app.post("/photo/recognize", tags=["Vision"])
@limit_expensive(max_requests=30, window_seconds=60)
async def recognize_photo(file: UploadFile = UploadFile(...)):
    """
    拍照识别单词（使用 OpenRouter GPT-4o-mini）

    - **file**: 上传的图片文件

    返回：
    - 识别出的单词列表
    - 场景描述（英文句子）
    - 场景翻译（中文翻译）

    限流：每个用户/IP 每分钟最多 30 次
    """
    import logging
    logger = logging.getLogger(__name__)

    try:
        # 读取图片数据
        image_data = await file.read()
        logger.info(f"收到图片识别请求，大小: {len(image_data)} 字节")

        # 转换为 base64
        base64_image = base64.b64encode(image_data).decode('utf-8')

        # 使用 GPT-4o-mini 一次调用完成所有功能
        logger.info("调用 OpenRouter GPT-4o-mini API...")

        response = await client.chat.completions.create(
            model="openai/gpt-4o-mini",
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

        # 解析响应
        result_text = response.choices[0].message.content
        result = json.loads(result_text)

        logger.info(f"识别成功: {len(result.get('objects', []))} 个物体")
        logger.info(f"场景描述: {result.get('scene_description', '')}")
        logger.info(f"场景翻译: {result.get('scene_translation', '')}")

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
