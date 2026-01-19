"""
场景理解模块
使用多模态大模型理解场景内容（支持 OpenRouter）
"""
from typing import List, Dict, Any, Optional
import os
import base64
import json
from openai import OpenAI, AsyncOpenAI


class SceneUnderstanding:
    """场景理解器 - 支持 OpenRouter"""

    def __init__(self):
        """初始化场景理解器"""
        self.api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
        self.use_openrouter = bool(os.getenv("OPENROUTER_API_KEY"))

        # OpenRouter 配置
        if self.use_openrouter:
            self.base_url = "https://openrouter.ai/api/v1"
            self.app_name = os.getenv("APP_NAME", "Photo English Learn")
            self.app_url = os.getenv("APP_URL", "https://github.com")
        else:
            self.base_url = None

        # 模型配置
        self.vision_model = os.getenv(
            "VISION_MODEL",
            "openai/gpt-4o" if self.use_openrouter else "gpt-4o"
        )
        self.text_model = os.getenv(
            "TEXT_MODEL",
            "openai/gpt-4o" if self.use_openrouter else "gpt-4o"
        )

        # 创建客户端
        if self.api_key:
            self.client = OpenAI(
                api_key=self.api_key,
                base_url=self.base_url,
            )
            self.async_client = AsyncOpenAI(
                api_key=self.api_key,
                base_url=self.base_url,
            )
        else:
            self.client = None
            self.async_client = None

    def _get_headers(self) -> Dict[str, str]:
        """获取 OpenRouter 请求头"""
        if not self.use_openrouter:
            return {}
        return {
            "HTTP-Referer": self.app_url,
            "X-Title": self.app_name,
        }

    def generate_description(
        self,
        image_data: bytes,
        detections: List[Dict[str, Any]],
        language: str = "zh"
    ) -> str:
        """
        生成场景描述

        Args:
            image_data: 图像数据
            detections: 检测到的物体列表
            language: 描述语言 ("zh" 或 "en")

        Returns:
            场景描述文本
        """
        # 提取检测到的物体名称
        objects = [det["english_word"] for det in detections]

        if not objects:
            return "这是一张照片" if language == "zh" else "This is a photo"

        # 使用 LLM 生成描述
        if self.client:
            return self._generate_with_llm(image_data, objects, language)
        else:
            # 简单模板生成
            return self._generate_template(objects, language)

    def _generate_with_llm(
        self,
        image_data: bytes,
        objects: List[str],
        language: str
    ) -> str:
        """使用 LLM 生成场景描述"""
        # 编码图像
        base64_image = base64.b64encode(image_data).decode('utf-8')

        # 构建提示词
        objects_str = ", ".join(objects)
        if language == "zh":
            prompt = f"请用中文描述这张照片。照片中包含: {objects_str}。请用简洁的语言描述这个场景（不超过50字）。"
        else:
            prompt = f"Describe this photo in English. The photo contains: {objects_str}. Keep it concise (under 50 words)."

        try:
            kwargs = {
                "model": self.vision_model,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                "max_tokens": 100
            }

            # OpenRouter 需要额外的 headers
            if self.use_openrouter:
                kwargs["extra_headers"] = self._get_headers()

            response = self.client.chat.completions.create(**kwargs)
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"LLM error: {e}")
            return self._generate_template(objects, language)

    def _generate_template(self, objects: List[str], language: str) -> str:
        """使用模板生成简单描述"""
        if language == "zh":
            if len(objects) == 1:
                return f"这是一张{objects[0]}的照片"
            elif len(objects) <= 3:
                objects_str = "、".join(objects)
                return f"这张照片里有{objects_str}"
            else:
                return f"这是一张包含多种物品的照片"
        else:
            if len(objects) == 1:
                return f"A photo of a {objects[0].lower()}"
            elif len(objects) <= 3:
                objects_str = ", ".join([o.lower() for o in objects])
                return f"A photo with {objects_str}"
            else:
                return f"A photo with various objects"

    def generate_sentence(
        self,
        scene_description: str,
        objects: List[str],
        difficulty: str = "beginner"
    ) -> Dict[str, str]:
        """
        基于场景生成有趣的英语短句

        Args:
            scene_description: 场景描述
            objects: 场景中的物体列表
            difficulty: 难度等级 (beginner, intermediate, advanced)

        Returns:
            包含英文句子和中文翻译的字典
        """
        if self.client:
            return self._generate_sentence_with_llm(scene_description, objects, difficulty)
        else:
            return self._generate_sentence_template(objects)

    def _generate_sentence_with_llm(
        self,
        scene_description: str,
        objects: List[str],
        difficulty: str
    ) -> Dict[str, str]:
        """使用 LLM 生成短句"""
        objects_str = ", ".join(objects)
        difficulty_instruction = {
            "beginner": "Use simple words and short sentences (under 10 words).",
            "intermediate": "Use common words and moderate length sentences (10-15 words).",
            "advanced": "Use varied vocabulary and more complex sentences (15-25 words)."
        }

        prompt = f"""Create an interesting and natural English sentence about this scene.

Scene description: {scene_description}
Objects in the scene: {objects_str}

Requirements:
{difficulty_instruction.get(difficulty, difficulty_instruction['beginner'])}
- Make the sentence sound natural and conversational
- Include 1-2 of the objects mentioned above
- Make it educational for English learners

Return the result in this JSON format:
{{"sentence": "English sentence here", "translation": "中文翻译"}}"""

        try:
            kwargs = {
                "model": self.text_model,
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"},
                "max_tokens": 150
            }

            # OpenRouter 需要额外的 headers
            if self.use_openrouter:
                kwargs["extra_headers"] = self._get_headers()

            response = self.client.chat.completions.create(**kwargs)
            result = json.loads(response.choices[0].message.content)
            return {
                "sentence": result.get("sentence", "This is a scene with " + objects[0].lower()),
                "translation": result.get("translation", "这是一个场景。")
            }
        except Exception as e:
            print(f"LLM error: {e}")
            return self._generate_sentence_template(objects)

    def _generate_sentence_template(self, objects: List[str]) -> Dict[str, str]:
        """使用模板生成短句"""
        if not objects:
            return {
                "sentence": "This is an interesting scene.",
                "translation": "这是一个有趣的场景。"
            }

        obj = objects[0].lower()
        templates = [
            {
                "sentence": f"I can see a {obj} in this picture.",
                "translation": f"我在这张照片里看到了一个{obj}。"
            },
            {
                "sentence": f"There is a {obj} here.",
                "translation": f"这里有一个{obj}。"
            },
            {
                "sentence": f"Look at this {obj}!",
                "translation": f"看这个{obj}！"
            }
        ]

        import random
        return random.choice(templates)


class AsyncSceneUnderstanding(SceneUnderstanding):
    """异步场景理解器"""

    def __init__(self):
        super().__init__()
        # 覆盖客户端为异步版本
        if self.api_key:
            self.client = None  # 同步客户端不使用
            self.async_client = AsyncOpenAI(
                api_key=self.api_key,
                base_url=self.base_url,
            )
        else:
            self.client = None
            self.async_client = None

    async def generate_description_async(
        self,
        image_data: bytes,
        detections: List[Dict[str, Any]],
        language: str = "zh"
    ) -> str:
        """异步生成场景描述"""
        objects = [det["english_word"] for det in detections]

        if not objects:
            return "这是一张照片" if language == "zh" else "This is a photo"

        if self.async_client:
            return await self._generate_with_llm_async(image_data, objects, language)
        else:
            return self._generate_template(objects, language)

    async def _generate_with_llm_async(
        self,
        image_data: bytes,
        objects: List[str],
        language: str
    ) -> str:
        """异步使用 LLM 生成场景描述"""
        base64_image = base64.b64encode(image_data).decode('utf-8')

        objects_str = ", ".join(objects)
        if language == "zh":
            prompt = f"请用中文描述这张照片。照片中包含: {objects_str}。请用简洁的语言描述这个场景（不超过50字）。"
        else:
            prompt = f"Describe this photo in English. The photo contains: {objects_str}. Keep it concise (under 50 words)."

        try:
            kwargs = {
                "model": self.vision_model,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{base64_image}"
                                }
                            }
                        ]
                    }
                ],
                "max_tokens": 100
            }

            if self.use_openrouter:
                kwargs["extra_headers"] = self._get_headers()

            response = await self.async_client.chat.completions.create(**kwargs)
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"LLM error: {e}")
            return self._generate_template(objects, language)

    async def generate_sentence_async(
        self,
        scene_description: str,
        objects: List[str],
        difficulty: str = "beginner"
    ) -> Dict[str, str]:
        """异步生成短句"""
        if self.async_client:
            return await self._generate_sentence_with_llm_async(scene_description, objects, difficulty)
        else:
            return self._generate_sentence_template(objects)

    async def _generate_sentence_with_llm_async(
        self,
        scene_description: str,
        objects: List[str],
        difficulty: str
    ) -> Dict[str, str]:
        """异步使用 LLM 生成短句"""
        objects_str = ", ".join(objects)
        difficulty_instruction = {
            "beginner": "Use simple words and short sentences (under 10 words).",
            "intermediate": "Use common words and moderate length sentences (10-15 words).",
            "advanced": "Use varied vocabulary and more complex sentences (15-25 words)."
        }

        prompt = f"""Create an interesting and natural English sentence about this scene.

Scene description: {scene_description}
Objects in the scene: {objects_str}

Requirements:
{difficulty_instruction.get(difficulty, difficulty_instruction['beginner'])}
- Make the sentence sound natural and conversational
- Include 1-2 of the objects mentioned above
- Make it educational for English learners

Return the result in this JSON format:
{{"sentence": "English sentence here", "translation": "中文翻译"}}"""

        try:
            kwargs = {
                "model": self.text_model,
                "messages": [{"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"},
                "max_tokens": 150
            }

            if self.use_openrouter:
                kwargs["extra_headers"] = self._get_headers()

            response = await self.async_client.chat.completions.create(**kwargs)
            result = json.loads(response.choices[0].message.content)
            return {
                "sentence": result.get("sentence", "This is a scene with " + objects[0].lower()),
                "translation": result.get("translation", "这是一个场景。")
            }
        except Exception as e:
            print(f"LLM error: {e}")
            return self._generate_sentence_template(objects)
