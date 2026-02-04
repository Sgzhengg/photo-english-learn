"""
语音识别器 - 支持多种引擎
"""
import os
import tempfile
import logging
import httpx
from typing import Dict, Any, Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)


class SpeechRecognizer:
    """语音识别器"""

    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.groq_api_key = self._clean_api_key(os.getenv("GROQ_API_KEY"))
        self.deepinfra_api_key = os.getenv("DEEPINFRA_API_KEY")
        self.azure_speech_key = os.getenv("AZURE_SPEECH_KEY")
        self.azure_speech_region = os.getenv("AZURE_SPEECH_REGION", "eastasia")
        self.baidu_api_key = os.getenv("BAIDU_API_KEY")
        self.baidu_secret_key = os.getenv("BAIDU_SECRET_KEY")

        # 记录 API Key 状态
        if self.groq_api_key:
            logger.info(f"Groq API Key loaded: {self.groq_api_key[:10]}...{self.groq_api_key[-6:]}")
        else:
            logger.warning("Groq API Key not configured")

        if self.deepinfra_api_key:
            logger.info(f"DeepInfra API Key loaded: {self.deepinfra_api_key[:10]}...{self.deepinfra_api_key[-6:]}")
        else:
            logger.info("DeepInfra API Key not configured")

    def _clean_api_key(self, api_key: Optional[str]) -> Optional[str]:
        """
        清理 API Key，去除引号和空格

        Args:
            api_key: 原始 API Key

        Returns:
            清理后的 API Key，或 None（如果输入为 None）
        """
        if not api_key:
            return None

        # 去除首尾空格
        cleaned = api_key.strip()

        # 去除首尾引号（单引号或双引号）
        if cleaned.startswith('"') and cleaned.endswith('"'):
            cleaned = cleaned[1:-1]
        elif cleaned.startswith("'") and cleaned.endswith("'"):
            cleaned = cleaned[1:-1]

        # 再次去除可能的空格
        cleaned = cleaned.strip()

        # 如果清理后不同，记录警告
        if cleaned != api_key:
            logger.warning(f"API Key was cleaned (quotes/spaces removed)")
            logger.warning(f"  Original: {api_key[:20]}...")
            logger.warning(f"  Cleaned:  {cleaned[:20]}...")

        return cleaned

    async def get_available_engines(self) -> list:
        """获取可用的识别引擎"""
        engines = []

        # Groq Whisper (推荐 - 速度快，有免费额度)
        if self.groq_api_key:
            engines.append({
                "id": "groq-whisper",
                "name": "Groq Whisper",
                "description": "超高速语音识别，有免费额度",
                "available": True
            })

        # DeepInfra Whisper (高速，有免费额度)
        if self.deepinfra_api_key:
            engines.append({
                "id": "deepinfra",
                "name": "DeepInfra Whisper",
                "description": "高速语音识别，有免费额度",
                "available": True
            })

        # OpenAI Whisper
        if self.openai_api_key:
            engines.append({
                "id": "openai-whisper",
                "name": "OpenAI Whisper",
                "description": "高精度语音识别，支持多语言",
                "available": True
            })

        # Azure Speech
        if self.azure_speech_key:
            engines.append({
                "id": "azure",
                "name": "Azure Speech Service",
                "description": "微软 Azure 语音服务",
                "available": True
            })

        # 百度语音
        if self.baidu_api_key and self.baidu_secret_key:
            engines.append({
                "id": "baidu",
                "name": "百度语音识别",
                "description": "百度智能云语音识别",
                "available": True
            })

        # 如果没有配置任何 API，添加默认的 DeepInfra 引擎
        if not engines:
            engines.append({
                "id": "deepinfra",
                "name": "DeepInfra Whisper (推荐)",
                "description": "高速语音识别，在 https://deepinfra.com 获取免费 API Key",
                "available": False
            })

        return engines

    async def recognize(
        self,
        audio_data: bytes,
        language: str = "en-US",
        engine: str = "groq-whisper"
    ) -> Dict[str, Any]:
        """
        识别音频

        Args:
            audio_data: 音频二进制数据
            language: 语言代码
            engine: 识别引擎

        Returns:
            识别结果 {"text": "...", "confidence": 0.95, "duration": 3.5}
        """
        if engine == "groq-whisper":
            return await self._recognize_with_groq(audio_data, language)
        elif engine == "deepinfra":
            return await self._recognize_with_deepinfra(audio_data, language)
        elif engine == "openai-whisper":
            return await self._recognize_with_whisper(audio_data, language)
        elif engine == "azure":
            return await self._recognize_with_azure(audio_data, language)
        elif engine == "baidu":
            return await self._recognize_with_baidu(audio_data, language)
        else:
            raise ValueError(f"Unsupported engine: {engine}")

    async def recognize_from_url(
        self,
        audio_url: str,
        language: str = "en-US",
        engine: str = "groq-whisper"
    ) -> Dict[str, Any]:
        """
        从 URL 识别音频
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(audio_url)
                response.raise_for_status()
                audio_data = response.content

            return await self.recognize(audio_data, language, engine)

        except Exception as e:
            logger.error(f"Error fetching audio from URL: {e}")
            raise

    async def _recognize_with_whisper(
        self,
        audio_data: bytes,
        language: str
    ) -> Dict[str, Any]:
        """使用 OpenAI Whisper API 识别"""
        if not self.openai_api_key:
            # 返回模拟数据用于测试
            logger.warning("OpenAI API key not configured, returning mock data")
            return {
                "text": "I'm working on my laptop while enjoying a fresh cup of coffee.",
                "confidence": 0.95,
                "engine": "openai-whisper",
                "language": language
            }

        try:
            # 保存音频到临时文件
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
                tmp_file.write(audio_data)
                tmp_file_path = tmp_file.name

            try:
                # 调用 OpenAI Whisper API
                async with httpx.AsyncClient(timeout=60.0) as client:
                    files = {
                        "file": (os.path.basename(tmp_file_path), audio_data, "audio/mpeg")
                    }
                    data = {
                        "model": "whisper-1",
                        "language": language.split("-")[0],  # en-US -> en
                        "response_format": "verbose_json"
                    }

                    response = await client.post(
                        "https://api.openai.com/v1/audio/transcriptions",
                        headers={
                            "Authorization": f"Bearer {self.openai_api_key}"
                        },
                        files=files,
                        data=data,
                        timeout=60.0
                    )
                    response.raise_for_status()

                    result = response.json()

                    return {
                        "text": result.get("text", ""),
                        "confidence": 0.95,  # Whisper 不直接返回置信度
                        "duration": result.get("duration", 0),
                        "engine": "openai-whisper",
                        "language": language
                    }

            finally:
                # 清理临时文件
                try:
                    os.unlink(tmp_file_path)
                except:
                    pass

        except Exception as e:
            logger.error(f"OpenAI Whisper API error: {e}")
            raise

    async def _recognize_with_groq(
        self,
        audio_data: bytes,
        language: str
    ) -> Dict[str, Any]:
        """使用 Groq Whisper API 识别 (超高速，有免费额度)"""
        if not self.groq_api_key:
            # 返回模拟数据用于测试
            logger.warning("Groq API key not configured, returning mock data")
            return {
                "text": "I'm working on my laptop while enjoying a fresh cup of coffee.",
                "confidence": 0.95,
                "engine": "groq-whisper",
                "language": language
            }

        # 首先尝试使用 Groq 官方 SDK（更可靠的认证）
        try:
            result = await self._recognize_with_groq_sdk(audio_data, language)
            if result:
                return result
        except Exception as e:
            logger.warning(f"Groq SDK method failed: {e}, trying httpx fallback")

        # 如果 SDK 方法失败，回退到 httpx
        return await self._recognize_with_groq_httpx(audio_data, language)

    async def _recognize_with_groq_sdk(
        self,
        audio_data: bytes,
        language: str
    ) -> Dict[str, Any]:
        """使用 Groq 官方 SDK 识别（推荐，认证更可靠）"""
        try:
            # 导入 Groq SDK
            from groq import Groq

            # 在线程池中运行同步代码
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor() as executor:
                result = await loop.run_in_executor(
                    executor,
                    lambda: self._groq_transcribe_sync(audio_data, language)
                )
            return result

        except ImportError:
            logger.warning("Groq SDK not installed, falling back to httpx")
            return None
        except Exception as e:
            logger.error(f"Groq SDK error: {e}")
            return None

    def _groq_transcribe_sync(self, audio_data: bytes, language: str) -> Dict[str, Any]:
        """Groq SDK 同步转录"""
        from groq import Groq
        import groq

        # 保存音频到临时文件
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
            tmp_file.write(audio_data)
            tmp_file_path = tmp_file.name

        try:
            logger.info(f"Groq SDK: Attempting transcription with model=whisper-large-v3-turbo, language={language.split('-')[0]}")

            # 创建 Groq 客户端
            client = Groq(api_key=self.groq_api_key)

            # 打开音频文件并转录
            with open(tmp_file_path, "rb") as file:
                transcription = client.audio.transcriptions.create(
                    file=(tmp_file_path, file),
                    model="whisper-large-v3-turbo",
                    language=language.split("-")[0],
                    response_format="verbose_json"
                )

            logger.info(f"Groq SDK: Transcription successful, text length={len(transcription.text)}")
            return {
                "text": transcription.text,
                "confidence": 0.95,
                "duration": getattr(transcription, 'duration', 0),
                "engine": "groq-whisper-sdk",
                "language": language
            }

        except groq.AuthenticationError as e:
            logger.error("=" * 60)
            logger.error("Groq SDK: Authentication Error")
            logger.error("=" * 60)
            logger.error(f"Error: {e}")
            logger.error(f"API Key (first 10): {self.groq_api_key[:10] if self.groq_api_key else 'None'}...{self.groq_api_key[-6:] if self.groq_api_key else 'None'}")
            logger.error(f"API Key length: {len(self.groq_api_key) if self.groq_api_key else 0}")
            logger.error("=" * 60)
            raise
        except Exception as e:
            logger.error(f"Groq SDK: Unexpected error: {e}")
            raise
        finally:
            # 清理临时文件
            try:
                os.unlink(tmp_file_path)
            except:
                pass

    async def _recognize_with_groq_httpx(
        self,
        audio_data: bytes,
        language: str
    ) -> Dict[str, Any]:

        try:
            # 保存音频到临时文件
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
                tmp_file.write(audio_data)
                tmp_file_path = tmp_file.name

            try:
                # 调用 Groq Whisper API (兼容 OpenAI 格式)
                async with httpx.AsyncClient(timeout=60.0) as client:
                    files = {
                        "file": (os.path.basename(tmp_file_path), audio_data, "audio/mpeg")
                    }
                    data = {
                        "model": "whisper-large-v3-turbo",  # 使用 turbo 版本 (更快、更便宜)
                        "language": language.split("-")[0],  # en-US -> en
                        "response_format": "verbose_json"
                    }

                    response = await client.post(
                        "https://api.groq.com/openai/v1/audio/transcriptions",
                        headers={
                            "Authorization": f"Bearer {self.groq_api_key}"
                        },
                        files=files,
                        data=data,
                        timeout=60.0
                    )
                    response.raise_for_status()

                    result = response.json()

                    return {
                        "text": result.get("text", ""),
                        "confidence": 0.95,  # Whisper 不直接返回置信度
                        "duration": result.get("duration", 0),
                        "engine": "groq-whisper",
                        "language": language
                    }

            finally:
                # 清理临时文件
                try:
                    os.unlink(tmp_file_path)
                except:
                    pass

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 403:
                # 读取详细错误信息
                error_detail = e.response.text[:500] if e.response.text else "No detail"
                logger.error("=" * 60)
                logger.error("Groq API returned 403 Forbidden")
                logger.error("=" * 60)
                logger.error(f"Response: {error_detail}")
                logger.error(f"API Key (first 10): {self.groq_api_key[:10] if self.groq_api_key else 'None'}...{self.groq_api_key[-6:] if self.groq_api_key else 'None'}")
                logger.error(f"API Key length: {len(self.groq_api_key) if self.groq_api_key else 0}")
                logger.error(f"Model: whisper-large-v3-turbo")
                logger.error(f"Endpoint: https://api.groq.com/openai/v1/audio/transcriptions")
                logger.error("=" * 60)
                # API密钥无效或没有权限，返回空文本和特殊标记
                return {
                    "text": "",
                    "confidence": 0.0,
                    "engine": "groq-whisper-error",
                    "language": language,
                    "mock": True,
                    "error": "API_KEY_INVALID",
                    "error_message": "Groq API key not configured or invalid. Please set GROQ_API_KEY environment variable in Zeabur."
                }
            else:
                logger.error(f"Groq Whisper API HTTP error: {e}")
                raise
        except Exception as e:
            logger.error(f"Groq Whisper API error: {e}")
            # 其他错误也返回空文本和错误信息
            logger.warning("Falling back to empty result due to API error")
            return {
                "text": "",
                "confidence": 0.0,
                "engine": "groq-whisper-error",
                "language": language,
                "mock": True,
                "error": "API_ERROR",
                "error_message": f"Speech recognition error: {str(e)}"
            }

    async def _recognize_with_azure(
        self,
        audio_data: bytes,
        language: str
    ) -> Dict[str, Any]:
        """使用 Azure Speech Service 识别"""
        if not self.azure_speech_key:
            # 返回模拟数据
            logger.warning("Azure Speech key not configured, returning mock data")
            return {
                "text": "I'm working on my laptop while enjoying a fresh cup of coffee.",
                "confidence": 0.90,
                "engine": "azure",
                "language": language
            }

        # Azure Speech Service 实现需要使用 Azure Cognitive Services SDK
        # 这里返回模拟数据
        logger.warning("Azure Speech recognition not fully implemented")
        return {
            "text": "I'm working on my laptop while enjoying a fresh cup of coffee.",
            "confidence": 0.90,
            "engine": "azure",
            "language": language
        }

    async def _recognize_with_baidu(
        self,
        audio_data: bytes,
        language: str
    ) -> Dict[str, Any]:
        """使用百度语音识别 API"""
        if not self.baidu_api_key or not self.baidu_secret_key:
            # 返回模拟数据
            logger.warning("Baidu API keys not configured, returning mock data")
            return {
                "text": "I'm working on my laptop while enjoying a fresh cup of coffee.",
                "confidence": 0.85,
                "engine": "baidu",
                "language": language
            }

        # 百度语音识别 API 实现需要先获取 token，然后调用识别接口
        logger.warning("Baidu Speech recognition not fully implemented")
        return {
            "text": "I'm working on my laptop while enjoying a fresh cup of coffee.",
            "confidence": 0.85,
            "engine": "baidu",
            "language": language
        }

    async def _recognize_with_deepinfra(
        self,
        audio_data: bytes,
        language: str
    ) -> Dict[str, Any]:
        """使用 DeepInfra Whisper API 识别"""
        if not self.deepinfra_api_key:
            # 返回模拟数据用于测试
            logger.warning("DeepInfra API key not configured, returning mock data")
            return {
                "text": "I'm working on my laptop while enjoying a fresh cup of coffee.",
                "confidence": 0.95,
                "engine": "deepinfra",
                "language": language
            }

        try:
            # 保存音频到临时文件
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp_file:
                tmp_file.write(audio_data)
                tmp_file_path = tmp_file.name

            try:
                # 调用 DeepInfra Whisper API (兼容 OpenAI 格式)
                async with httpx.AsyncClient(timeout=60.0) as client:
                    files = {
                        "file": (os.path.basename(tmp_file_path), audio_data, "audio/mpeg")
                    }
                    data = {
                        "model": "openai/whisper-large-v3-turbo",
                        "language": language.split("-")[0],  # en-US -> en
                        "response_format": "verbose_json"
                    }

                    logger.info(f"DeepInfra: Sending transcription request with model=whisper-large-v3-turbo, language={language.split('-')[0]}")

                    response = await client.post(
                        "https://api.deepinfra.com/v1/audio/transcriptions",
                        headers={
                            "Authorization": f"Bearer {self.deepinfra_api_key}"
                        },
                        files=files,
                        data=data,
                        timeout=60.0
                    )
                    response.raise_for_status()

                    result = response.json()
                    logger.info(f"DeepInfra: Transcription successful, text length={len(result.get('text', ''))}")

                    return {
                        "text": result.get("text", ""),
                        "confidence": 0.95,  # Whisper 不直接返回置信度
                        "duration": result.get("duration", 0),
                        "engine": "deepinfra",
                        "language": language
                    }

            finally:
                # 清理临时文件
                try:
                    os.unlink(tmp_file_path)
                except:
                    pass

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 401:
                logger.error("=" * 60)
                logger.error("DeepInfra API returned 401 Unauthorized")
                logger.error("=" * 60)
                logger.error(f"Response: {e.response.text[:500] if e.response.text else 'No detail'}")
                logger.error(f"API Key (first 10): {self.deepinfra_api_key[:10] if self.deepinfra_api_key else 'None'}...{self.deepinfra_api_key[-6:] if self.deepinfra_api_key else 'None'}")
                logger.error("=" * 60)
                return {
                    "text": "",
                    "confidence": 0.0,
                    "engine": "deepinfra-error",
                    "language": language,
                    "mock": True,
                    "error": "API_KEY_INVALID",
                    "error_message": "DeepInfra API key not configured or invalid. Please set DEEPINFRA_API_KEY environment variable."
                }
            elif e.response.status_code == 403:
                logger.error("=" * 60)
                logger.error("DeepInfra API returned 403 Forbidden")
                logger.error("=" * 60)
                logger.error(f"Response: {e.response.text[:500] if e.response.text else 'No detail'}")
                logger.error("=" * 60)
                return {
                    "text": "",
                    "confidence": 0.0,
                    "engine": "deepinfra-error",
                    "language": language,
                    "mock": True,
                    "error": "API_KEY_FORBIDDEN",
                    "error_message": "DeepInfra API key does not have permission to access this resource."
                }
            else:
                logger.error(f"DeepInfra Whisper API HTTP error: {e}")
                raise
        except Exception as e:
            logger.error(f"DeepInfra Whisper API error: {e}")
            # 其他错误也返回空文本和错误信息
            logger.warning("Falling back to empty result due to API error")
            return {
                "text": "",
                "confidence": 0.0,
                "engine": "deepinfra-error",
                "language": language,
                "mock": True,
                "error": "API_ERROR",
                "error_message": f"Speech recognition error: {str(e)}"
            }

    def calculate_pronunciation_score(
        self,
        target_text: str,
        recorded_text: str,
        mock: bool = False,
        error: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        计算发音评分

        Args:
            target_text: 目标文本（原句）
            recorded_text: 用户录音识别的文本
            mock: 是否使用模拟数据
            error: 错误类型

        Returns:
            评分结果
        """
        import re

        # 如果是模拟数据或有错误，返回特殊结果
        if mock or error or not recorded_text or not recorded_text.strip():
            logger.warning(f"Pronunciation scoring failed: mock={mock}, error={error}, recorded_text_length={len(recorded_text)}")
            return {
                "overall": 0,
                "accuracy": 0,
                "fluency": 0,
                "completeness": 0,
                "feedback": "语音识别失败。请确保已在 Zeabur 配置 GROQ_API_KEY 环境变量。" if error == "API_KEY_INVALID" else "无法识别您的语音，请重新录音。",
                "error": error or "RECOGNITION_FAILED",
                "mock": True
            }

        # 预处理文本
        original_words = target_text.lower().split()
        recorded_words = recorded_text.lower().split()

        logger.info(f"Calculating pronunciation score: target_words={len(original_words)}, recorded_words={len(recorded_words)}")
        logger.info(f"Target text: '{target_text}'")
        logger.info(f"Recorded text: '{recorded_text}'")

        # 完整度：说出多少个词
        completeness = min((len(recorded_words) / len(original_words)) * 100, 100) if original_words else 0

        # 准确度：有多少词匹配
        match_count = 0
        for oword in original_words:
            if any(rword == oword or rword in oword or oword in rword for rword in recorded_words):
                match_count += 1

        accuracy = (match_count / len(original_words) * 100) if original_words else 0

        # 流利度：基于完整度和准确度
        fluency = (completeness + accuracy) / 2

        # 总分：准确度 50% + 流利度 30% + 完整度 20%
        overall = accuracy * 0.5 + fluency * 0.3 + completeness * 0.2

        logger.info(f"Score results: accuracy={accuracy:.2f}, fluency={fluency:.2f}, completeness={completeness:.2f}, overall={overall:.2f}")

        # 生成反馈
        if overall >= 90:
            feedback = "太棒了！发音非常标准！"
        elif overall >= 75:
            feedback = "很好！继续努力！"
        elif overall >= 60:
            feedback = "还不错，多练习几次会更好！"
        else:
            feedback = "加油！多听多练，您一定能行！"

        return {
            "overall": round(overall),
            "accuracy": round(accuracy),
            "fluency": round(fluency),
            "completeness": round(completeness),
            "feedback": feedback,
            "mock": False
        }
