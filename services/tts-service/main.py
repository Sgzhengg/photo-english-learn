"""
TTS 服务 - 语音合成
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径（支持 Zeabur 部署）
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated, List, Optional
import os
import tempfile
import atexit

from shared.database.models import User
from shared.database.database import get_async_db
from shared.utils.auth import get_current_user_optional
from shared.utils.response import success_response
from shared.tts.synthesizer import TTSSynthesizer

# 临时文件列表,用于清理
_temp_files = set()


def cleanup_temp_files():
    """清理所有临时文件"""
    for temp_file in _temp_files:
        try:
            if os.path.exists(temp_file):
                os.remove(temp_file)
        except Exception:
            pass


# 注册退出时清理
atexit.register(cleanup_temp_files)

# 初始化 FastAPI 应用
app = FastAPI(
    title="TTS Service",
    description="TTS 服务 - 语音合成",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite 默认端口
        "http://localhost:3000",  # 其他常用端口
        "http://localhost:5174",  # 备用端口
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",  # 开发环境允许所有来源
    ],
    allow_credentials=False,  # 使用 False 时可以用 "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 TTS 合成器
tts = TTSSynthesizer()


@app.get("/", tags=["Health"])
async def root():
    """健康检查"""
    return success_response(data={"message": "TTS Service is running", "service": "tts"})


@app.post("/synthesize", tags=["TTS"])
async def synthesize_speech(
    text: str,
    voice: str = "en-US-JennyNeural",
    rate: str = "medium",
    current_user: Annotated[Optional[User], Depends(get_current_user_optional)] = None
):
    """
    合成语音

    - **text**: 要合成的文本
    - **voice**: 音色 (默认: en-US-JennyNeural)
    - **rate**: 语速 (slow, medium, fast)
    """
    try:
        # 生成音频文件
        audio_data = await tts.synthesize(text, voice=voice, rate=rate)

        # 保存到临时文件
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            tmp.write(audio_data)
            tmp_path = tmp.name
            # 记录临时文件,用于后续清理
            _temp_files.add(tmp_path)

        # 返回音频文件(使用背景任务清理)
        from fastapi import BackgroundTasks

        def cleanup_file(path: str):
            """清理单个临时文件"""
            try:
                if path in _temp_files:
                    _temp_files.remove(path)
                if os.path.exists(path):
                    os.remove(path)
            except Exception:
                pass

        # 创建背景任务来清理文件(在文件发送后)
        # 注意:FileResponse 会在文件发送完成后自动处理,但我们仍然注册清理
        return FileResponse(
            tmp_path,
            media_type="audio/mpeg",
            filename=f"{text[:20]}.mp3"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"语音合成失败: {str(e)}"
        )


@app.get("/voices", tags=["TTS"])
async def get_available_voices():
    """
    获取可用的音色列表
    """
    voices = tts.get_available_voices()
    return success_response(data=voices)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
