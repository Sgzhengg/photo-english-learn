"""
TTS 语音合成模块
支持 Edge-TTS 和 Azure TTS
"""
from typing import List, Dict, Any, Optional
import os
import io


class TTSSynthesizer:
    """TTS 语音合成器"""

    def __init__(self, backend: str = "edge"):
        """
        初始化 TTS 合成器

        Args:
            backend: 后端类型 (edge 或 azure)
        """
        self.backend = backend
        self.azure_key = os.getenv("AZURE_TTS_KEY")
        self.azure_region = os.getenv("AZURE_TTS_REGION", "eastus")

    async def synthesize(
        self,
        text: str,
        voice: str = "en-US-JennyNeural",
        rate: str = "medium",
        output_format: str = "mp3"
    ) -> bytes:
        """
        合成语音

        Args:
            text: 要合成的文本
            voice: 音色名称
            rate: 语速 (slow, medium, fast)
            output_format: 输出格式 (mp3, wav)

        Returns:
            音频数据（二进制）
        """
        if self.backend == "azure" and self.azure_key:
            return await self._synthesize_azure(text, voice, rate, output_format)
        else:
            return await self._synthesize_edge(text, voice, rate)

    async def _synthesize_edge(
        self,
        text: str,
        voice: str,
        rate: str
    ) -> bytes:
        """使用 Edge-TTS 合成"""
        try:
            import edge_tts

            # 创建通信对象
            communicate = edge_tts.Communicate(text, voice)

            # 语速调整
            rate_str = {
                "slow": "+0%",
                "medium": "+0%",
                "fast": "+20%"
            }.get(rate, "+0%")

            # 生成音频
            audio_buffer = io.BytesIO()
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_buffer.write(chunk["data"])

            return audio_buffer.getvalue()

        except ImportError:
            # 如果没有安装 edge-tts，使用 Mock 数据
            print("Warning: edge-tts not installed, returning mock audio")
            return self._mock_audio()

    async def _synthesize_azure(
        self,
        text: str,
        voice: str,
        rate: str,
        output_format: str
    ) -> bytes:
        """使用 Azure TTS 合成"""
        try:
            import azure.cognitiveservices.speech as speechsdk

            # 创建配置
            speech_config = speechsdk.SpeechConfig(
                subscription=self.azure_key,
                region=self.azure_region
            )
            speech_config.speech_synthesis_voice_name = voice

            # 设置输出格式
            if output_format == "mp3":
                speech_config.set_speech_synthesis_output_format(
                    speechsdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3
                )

            # 创建合成器
            synthesizer = speechsdk.SpeechSynthesizer(
                speech_config=speech_config,
                audio_config=None
            )

            # 构建 SSML（支持语速调整）
            rate_str = {
                "slow": "0.8",
                "medium": "1.0",
                "fast": "1.2"
            }.get(rate, "1.0")

            ssml = f'''
            <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
                <voice name="{voice}">
                    <prosody rate="{rate_str}">
                        {text}
                    </prosody>
                </voice>
            </speak>
            '''

            # 合成
            result = synthesizer.speak_ssml_async(ssml).get()

            if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
                return result.audio_data
            else:
                raise Exception(f"Azure TTS failed: {result.reason}")

        except ImportError:
            print("Warning: azure-cognitiveservices-speech not installed")
            return await self._synthesize_edge(text, voice, rate)

    def _mock_audio(self) -> bytes:
        """生成 Mock 音频（空 MP3 文件）"""
        # 返回一个最小的 MP3 文件头
        return b'\xff\xfb\x90\x00' * 100

    def get_available_voices(self) -> List[Dict[str, str]]:
        """
        获取可用的音色列表

        Returns:
            音色列表，每个包含:
            - id: 音色 ID
            - name: 显示名称
            - language: 语言
            - gender: 性别
        """
        # 常用英语音色
        voices = [
            {"id": "en-US-JennyNeural", "name": "Jenny (US)", "language": "en-US", "gender": "Female"},
            {"id": "en-US-GuyNeural", "name": "Guy (US)", "language": "en-US", "gender": "Male"},
            {"id": "en-GB-SoniaNeural", "name": "Sonia (UK)", "language": "en-GB", "gender": "Female"},
            {"id": "en-GB-RyanNeural", "name": "Ryan (UK)", "language": "en-GB", "gender": "Male"},
            {"id": "en-AU-NatashaNeural", "name": "Natasha (Australia)", "language": "en-AU", "gender": "Female"},
        ]

        return voices


class PronunciationScorer:
    """发音评分器（可选功能）"""

    def __init__(self):
        """初始化评分器"""
        self.api_key = os.getenv("AZURE_TTS_KEY")
        self.azure_region = os.getenv("AZURE_TTS_REGION", "eastus")

    async def score_pronunciation(
        self,
        reference_text: str,
        audio_data: bytes
    ) -> Dict[str, Any]:
        """
        评分发音质量

        Args:
            reference_text: 参考文本
            audio_data: 用户录音数据

        Returns:
            评分结果，包含:
            - accuracy_score: 准确度分数 (0-100)
            - fluency_score: 流利度分数 (0-100)
            - prosody_score: 韵律分数 (0-100)
            - total_score: 总分 (0-100)
        """
        if not self.api_key:
            # Mock 评分
            import random
            return {
                "accuracy_score": random.randint(70, 95),
                "fluency_score": random.randint(70, 95),
                "prosody_score": random.randint(70, 95),
                "total_score": random.randint(70, 95)
            }

        try:
            import azure.cognitiveservices.speech as speechsdk

            # 创建配置
            speech_config = speechsdk.SpeechConfig(
                subscription=self.api_key,
                region=self.azure_region
            )

            # 创建 pronunciation assessment 配置
            pronunciation_config = speechsdk.PronunciationAssessmentConfig(
                reference_text=reference_text,
                grading_system=speechsdk.PronunciationAssessmentGradingSystem.HundredMark,
                granularity=speechsdk.PronunciationAssessmentGranularity.Phoneme
            )

            # 创建音频流
            audio_stream = speechsdk.audio.PushAudioInputStream()
            audio_stream.write(audio_data)
            audio_stream.close()

            # 创建识别器
            audio_config = speechsdk.audio.AudioConfig(stream=audio_stream)
            recognizer = speechsdk.SpeechRecognizer(
                speech_config=speech_config,
                audio_config=audio_config
            )

            # 应用 pronunciation assessment 配置
            pronunciation_config.apply_to(recognizer)

            # 识别
            result = recognizer.recognize_once()

            if result.reason == speechsdk.ResultReason.RecognizedSpeech:
                pronunciation_result = speechsdk.PronunciationAssessmentResult(result)
                return {
                    "accuracy_score": pronunciation_result.accuracy_score,
                    "fluency_score": pronunciation_result.fluency_score,
                    "prosody_score": pronunciation_result.prosody_score,
                    "total_score": (
                        pronunciation_result.accuracy_score * 0.6 +
                        pronunciation_result.fluency_score * 0.2 +
                        pronunciation_result.prosody_score * 0.2
                    )
                }
            else:
                raise Exception(f"Recognition failed: {result.reason}")

        except ImportError:
            print("Warning: azure-cognitiveservices-speech not installed")
            import random
            return {
                "accuracy_score": random.randint(70, 95),
                "fluency_score": random.randint(70, 95),
                "prosody_score": random.randint(70, 95),
                "total_score": random.randint(70, 95)
            }
