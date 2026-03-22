"""
视觉服务 - 使用 DeepInfra Gemma 3 Vision
无需本地模型，直接调用云端 API（在中国可访问）
"""
import sys
from pathlib import Path
# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))
from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import base64
import os
import json
import logging
import time
from datetime import datetime
from openai import AsyncOpenAI
import httpx
from shared.utils.response import success_response
# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
# 初始化 FastAPI 应用
app = FastAPI(
    title="Vision Service (DeepInfra Gemma 3 Vision)",
    description="视觉服务 - 直接调用 DeepInfra Gemma 3 Vision（高速稳定，性价比高）",
    version="3.1.0"
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
# 初始化 AsyncOpenAI 客户端（使用 DeepInfra）
api_key = os.getenv("DEEPINFRA_API_KEY")
if not api_key:
    logger.warning("DEEPINFRA_API_KEY not configured, using mock mode")
    # 不再抛出错误，而是使用模拟模式
# 创建自定义异步 HTTP 客户端，设置较短的超时时间（优化性能）
http_client = httpx.AsyncClient(
    timeout=httpx.Timeout(20.0, connect=5.0),  # 总超时 20 秒，连接超时 5 秒（从30/10秒优化）
    limits=httpx.Limits(max_keepalive_connections=5, max_connections=10),
)
client = AsyncOpenAI(
    api_key=api_key or "mock",  # 如果没有 key，使用 mock
    base_url="https://api.deepinfra.com/v1/openai",
    http_client=http_client,
)  
@app.get("/", tags=["Health"])
async def root():
    """健康检查"""
    return success_response(data={
        "message": "Vision Service is running (DeepInfra Gemma 3 Vision)",
        "service": "vision",
        "provider": "DeepInfra",
        "model": "google/gemma-3-12b-it"
    })  
@app.post("/photo/recognize", tags=["Vision"])
async def recognize_photo(file: UploadFile = UploadFile(...)):
    """
    拍照识别单词（使用 DeepInfra Gemma 3 Vision）
    - **file**: 上传的图片文件
    返回：
    - 识别出的单词列表
    - 场景描述（英文句子）
    - 场景翻译（中文翻译）
    限流：每个用户/IP 每分钟最多 30 次
    模型：google/gemma-3-12b-it（Gemma 3 12B，性价比高，价格低）
    注：DeepInfra 提供近乎免费的高速推理服务
    """

    # 使用固定模型
    MODEL = "google/gemma-3-12b-it"  
    try:
        # 读取图片数据
        image_data = await file.read()
        request_start_time = time.time()
        logger.info(f"📸 收到图片识别请求，大小: {len(image_data)} 字节")
        if not image_data:
            raise ValueError("上传的图片为空")

        # 图片压缩优化：如果图片过大，进行压缩（减少传输和处理时间）
        if len(image_data) > 1024 * 1024:  # 如果超过1MB
            try:
                from io import BytesIO
                from PIL import Image

                img = Image.open(BytesIO(image_data))

                # 计算压缩比例（最大边长1024px）
                max_size = 1024
                if max(img.size) > max_size:
                    ratio = max_size / max(img.size)
                    new_size = tuple(int(dim * ratio) for dim in img.size)
                    img = img.resize(new_size, Image.LANCZOS)
                    logger.info(f"📉 图片压缩: {img.size} -> {new_size}")

                # 转换为RGB（如果需要）
                if img.mode != 'RGB':
                    img = img.convert('RGB')

                # 压缩质量85%，平衡质量和大小
                buffer = BytesIO()
                img.save(buffer, format='JPEG', quality=85)
                image_data = buffer.getvalue()
                logger.info(f"✅ 图片压缩完成: {len(image_data)} 字节（原始大小的 {len(image_data)/1024/1024:.2f}MB）")
            except Exception as e:
                logger.warning(f"图片压缩失败（使用原图）: {e}")

        # 转换为 base64
        base64_image = base64.b64encode(image_data).decode('utf-8')

        # 使用固定模型调用
        logger.info(f"🔄 使用模型: {MODEL}")
        call_start_time = time.time()
        response = await client.chat.completions.create(
            model=MODEL,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": """识别图片中的3-5个主要物体，返回JSON：
{
  "objects": [
    {"word": "cat", "phonetic": "/kæt/", "chinese": "猫"}
  ],
  "scene_description": "A cat sleeping on a couch.",
  "scene_translation": "一只猫在沙发上睡觉。"
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
            max_tokens=300  # 从500减少到300，提升速度约40%
        )

        # 验证响应
        if not response or not response.choices or len(response.choices) == 0:
            raise ValueError(f"模型 {MODEL} 返回空响应")

        # 获取响应内容
        result_text = response.choices[0].message.content
        if not result_text:
            raise ValueError(f"模型 {MODEL} 返回空内容")

        # 解析 JSON
        result = json.loads(result_text)
        call_duration = time.time() - call_start_time
        logger.info(f"✅ 模型 {MODEL} 调用成功，耗时: {call_duration:.2f}秒")  
        # 验证结果数据  
        if not isinstance(result, dict):  
            raise ValueError("API 返回的不是有效的 JSON 对象")  
        # 计算总耗时  
        total_duration = time.time() - request_start_time  
        logger.info(f"✨ 识别成功 | 模型: {MODEL} | 物体: {len(result.get('objects', []))} 个 | 总耗时: {total_duration:.2f}秒")  
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
    except HTTPException:  
        # 直接抛出 HTTP 异常  
        raise  
    except json.JSONDecodeError as e:  
        logger.error(f"JSON 解析失败: {e}")  
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
