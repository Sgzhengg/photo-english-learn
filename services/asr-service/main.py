"""
ASR 服务 - 语音识别服务
支持多种语音识别引擎
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, Optional
import os
import tempfile
import logging
import json

from shared.database.models import User
from shared.database.database import get_async_db
from shared.utils.auth import get_current_user_optional
from shared.utils.response import success_response
from shared.asr.recognizer import SpeechRecognizer

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 初始化 FastAPI 应用
app = FastAPI(
    title="ASR Service",
    description="ASR 服务 - 语音识别",
    version="1.0.0"
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
        "*",  # 允许所有来源
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化语音识别器
recognizer = SpeechRecognizer()


@app.get("/", tags=["Health"])
async def root():
    """健康检查"""
    return success_response(data={"message": "ASR Service is running", "service": "asr"})


@app.post("/recognize", tags=["ASR"])
async def recognize_audio(
    audio_file: UploadFile = File(...),
    language: str = "en-US",
    engine: str = "groq-whisper",  # groq-whisper, openai-whisper, azure, baidu
    current_user: Annotated[Optional[User], Depends(get_current_user_optional)] = None
):
    """
    语音识别 - 将音频转换为文本

    支持的引擎：
    - groq-whisper: Groq Whisper API（推荐，超高速，有免费额度）
    - openai-whisper: OpenAI Whisper API（准确度高，需要付费）
    - azure: Azure Speech Service
    - baidu: 百度语音识别（需要配置 API key）

    参数：
    - audio_file: 音频文件（支持 mp3, wav, m4a, ogg 等格式）
    - language: 语言代码（默认 en-US）
    - engine: 识别引擎（默认 groq-whisper）
    """
    try:
        # 验证文件类型
        if not audio_file.content_type.startswith("audio/"):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Please upload an audio file."
            )

        # 读取音频文件
        audio_data = await audio_file.read()

        logger.info(f"Processing audio file: {audio_file.filename}, size: {len(audio_data)} bytes")

        # 调用语音识别
        result = await recognizer.recognize(
            audio_data=audio_data,
            language=language,
            engine=engine
        )

        return success_response(data=result)

    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process audio: {str(e)}"
        )


@app.post("/recognize-url", tags=["ASR"])
async def recognize_audio_url(
    audio_url: str = Form(...),
    language: str = Form("en-US"),
    engine: str = Form("groq-whisper"),
    current_user: Annotated[Optional[User], Depends(get_current_user_optional)] = None
):
    """
    语音识别 - 通过 URL 识别音频

    适用于已经上传到云存储的音频文件
    """
    try:
        logger.info(f"Recognizing audio from URL: {audio_url}")

        result = await recognizer.recognize_from_url(
            audio_url=audio_url,
            language=language,
            engine=engine
        )

        return success_response(data=result)

    except Exception as e:
        logger.error(f"Error recognizing audio from URL: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to recognize audio: {str(e)}"
        )


@app.post("/evaluate-pronunciation", tags=["ASR"])
async def evaluate_pronunciation(
    audio_file: UploadFile = File(...),
    target_text: str = Form(...),
    language: str = Form("en-US"),
    current_user: Annotated[Optional[User], Depends(get_current_user_optional)] = None
):
    """
    发音评分 - 对比用户录音和目标文本，给出评分

    返回：
    - overall: 总分 (0-100)
    - accuracy: 准确度 (0-100)
    - fluency: 流利度 (0-100)
    - completeness: 完整度 (0-100)
    - feedback: 反馈建议
    - recorded_text: 识别出的文本
    """
    try:
        # 读取音频文件
        audio_data = await audio_file.read()

        # 语音识别
        recognition_result = await recognizer.recognize(
            audio_data=audio_data,
            language=language,
            engine="groq-whisper"
        )

        recorded_text = recognition_result.get("text", "")

        # 计算评分
        score = recognizer.calculate_pronunciation_score(
            target_text=target_text,
            recorded_text=recorded_text
        )

        return success_response(data={
            "recorded_text": recorded_text,
            "target_text": target_text,
            "score": score
        })

    except Exception as e:
        logger.error(f"Error evaluating pronunciation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to evaluate pronunciation: {str(e)}"
        )


@app.get("/engines", tags=["ASR"])
async def list_engines(
    current_user: Annotated[Optional[User], Depends(get_current_user_optional)] = None
):
    """
    获取支持的语音识别引擎列表
    """
    engines = await recognizer.get_available_engines()
    return success_response(data={"engines": engines})


@app.get("/config", tags=["ASR"])
async def get_config(
    current_user: Annotated[Optional[User], Depends(get_current_user_optional)] = None
):
    """
    获取 ASR 服务配置信息
    """
    return success_response(data={
        "supported_languages": ["en-US", "en-GB", "zh-CN"],
        "supported_engines": ["groq-whisper", "openai-whisper", "azure", "baidu"],
        "default_engine": "groq-whisper",
        "default_language": "en-US",
        "max_audio_size": 25 * 1024 * 1024,  # 25MB
        "supported_formats": ["mp3", "wav", "m4a", "ogg", "flac"]
    })


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
