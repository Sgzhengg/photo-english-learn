"""
视觉服务 - 使用阿里云视觉智能 + 通义千问
国内稳定访问，无地区限制
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
import logging

import httpx

from shared.database.database import get_async_db
from shared.utils.response import success_response
from shared.utils.rate_limit import limit_expensive

# 初始化 FastAPI 应用
app = FastAPI(
    title="Vision Service (阿里云)",
    description="视觉服务 - 使用阿里云视觉智能 + 通义千问",
    version="3.0.0"
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

# 获取环境变量
ALIYUN_ACCESS_KEY_ID = os.getenv("ALIYUN_ACCESS_KEY_ID")
ALIYUN_ACCESS_KEY_SECRET = os.getenv("ALIYUN_ACCESS_KEY_SECRET")
DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY")  # 通义千问 API Key

if not ALIYUN_ACCESS_KEY_ID or not ALIYUN_ACCESS_KEY_SECRET:
    raise ValueError("阿里云 Access Key 配置缺失，需要配置 ALIYUN_ACCESS_KEY_ID 和 ALIYUN_ACCESS_KEY_SECRET")

if not DASHSCOPE_API_KEY:
    raise ValueError("通义千问 API Key 配置缺失，需要配置 DASHSCOPE_API_KEY")

logger = logging.getLogger(__name__)


@app.get("/", tags=["Health"])
async def root():
    """健康检查"""
    return success_response(data={
        "message": "Vision Service is running (阿里云视觉智能 + 通义千问)",
        "service": "vision",
        "provider": "阿里云",
        "model": "通义千问"
    })


@app.post("/photo/recognize", tags=["Vision"])
@limit_expensive(max_requests=30, window_seconds=60)
async def recognize_photo(file: UploadFile = UploadFile(...)):
    """
    拍照识别单词（使用阿里云）

    - **file**: 上传的图片文件

    返回：
    - 识别出的单词列表
    - 场景描述（英文句子）
    - 场景翻译（中文翻译）

    限流：每个用户/IP 每分钟最多 30 次
    """
    try:
        # 读取图片数据
        image_data = await file.read()
        logger.info(f"收到图片识别请求，大小: {len(image_data)} 字节")

        # 转换为 base64
        base64_image = base64.b64encode(image_data).decode('utf-8')

        # 方案：暂时返回模拟数据
        # TODO: 集成阿里云视觉智能 + 通义千问
        logger.warning("使用模拟数据（未集成阿里云 API）")

        # 模拟识别结果
        mock_result = {
            "objects": [
                {"word": "child", "chinese": "孩子", "phonetic": "/tʃaɪld/", "position": 0},
                {"word": "table", "chinese": "桌子", "phonetic": "/ˈteɪbəl/", "position": 1},
                {"word": "block", "chinese": "积木", "phonetic": "/blɒk/", "position": 2},
            ],
            "scene_description": "Children are sitting at a table playing with wooden blocks.",
            "scene_translation": "孩子们坐在桌子旁玩木制积木。"
        }

        logger.info(f"识别成功（模拟）: {len(mock_result['objects'])} 个物体")

        # 构造返回数据
        words = []
        for idx, obj in enumerate(mock_result['objects']):
            words.append({
                "id": f"word-{idx}",
                "word": obj['word'],
                "phonetic": obj.get('phonetic', ''),
                "definition": obj['chinese'],
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
                "location": "识别成功（模拟数据）",
                "status": "completed"
            },
            "words": words,
            "sceneDescription": mock_result['scene_description'],
            "sceneTranslation": mock_result['scene_translation']
        })

    except Exception as e:
        logger.error(f"图片识别失败: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"图片识别失败: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
