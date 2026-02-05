"""
场景理解模块
使用多模态大模型理解场景内容（使用 DeepInfra）
"""
from typing import List, Dict, Any, Optional
import os
import base64
import json
from openai import OpenAI, AsyncOpenAI


class SceneUnderstanding:
    """场景理解器 - 使用 DeepInfra API"""

    def __init__(self):
        """初始化场景理解器"""
        self.api_key = os.getenv("DEEPINFRA_API_KEY")

        # DeepInfra 配置
        self.base_url = "https://api.deepinfra.com/v1/openai"

        # 模型配置（使用 Qwen3-32B，性价比高，中文能力强）
        self.text_model = os.getenv("TEXT_MODEL", "Qwen/Qwen3-32B")

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

    def generate_description(
        self,
        image_data: bytes,
        detections: List[Dict[str, Any]],
        language: str = "zh"
    ) -> str:
        """
        生成场景描述（已弃用，使用模板生成）

        Args:
            image_data: 图像数据
            detections: 检测到的物体列表
            language: 描述语言 ("zh" 或 "en")

        Returns:
            场景描述文本
        """
        # 提取检测到的物体名称
        objects = [det["english_word"] for det in detections]
        # 简单模板生成（不使用 LLM，因为 Qwen3-32B 不支持图像）
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
            response = self.client.chat.completions.create(
                model=self.text_model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                max_tokens=150
            )
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
    """异步场景理解器 - 使用 DeepInfra API"""

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
        """异步生成场景描述（使用模板）"""
        objects = [det["english_word"] for det in detections]

        if not objects:
            return "这是一张照片" if language == "zh" else "This is a photo"

        # 简单模板生成（不使用 LLM，因为 Qwen3-32B 不支持图像）
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
            response = await self.async_client.chat.completions.create(
                model=self.text_model,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                max_tokens=150
            )
            result = json.loads(response.choices[0].message.content)
            return {
                "sentence": result.get("sentence", "This is a scene with " + objects[0].lower()),
                "translation": result.get("translation", "这是一个场景。")
            }
        except Exception as e:
            print(f"LLM error: {e}")
            return self._generate_sentence_template(objects)
