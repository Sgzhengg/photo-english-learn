"""
词典 API - 查询单词信息
"""
from typing import Optional, Dict, Any
import httpx
import os


class DictionaryAPI:
    """词典 API 类"""

    def __init__(self):
        self.api_key = os.getenv("YOUDAO_API_KEY") or os.getenv("DICT_API_KEY")
        self.base_url = "https://openapi.youdao.com/api"

    async def lookup(self, english_word: str) -> Optional[Dict[str, Any]]:
        """
        查询单词

        Args:
            english_word: 英文单词

        Returns:
            单词信息字典，包含:
            - english_word: 英文单词
            - chinese_meaning: 中文释义
            - phonetic_us: 美式音标
            - phonetic_uk: 英式音标
            - example_sentence: 例句
            - example_translation: 例句翻译
        """
        # 先尝试从有道 API 获取
        word_data = await self._fetch_from_youdao(english_word)
        if word_data:
            return word_data

        # 备用：使用本地数据或 Mock
        return self._mock_data(english_word)

    async def _fetch_from_youdao(self, english_word: str) -> Optional[Dict[str, Any]]:
        """从有道 API 获取单词信息"""
        if not self.api_key:
            return None

        try:
            async with httpx.AsyncClient() as client:
                # 有道 API 调用
                # 这里简化处理，实际需要签名等
                params = {
                    "q": english_word,
                    "appKey": self.api_key,
                }
                response = await client.get(self.base_url, params=params)
                data = response.json()

                if data.get("errorCode") == "0":
                    # 解析响应
                    return self._parse_youdao_response(data)
        except Exception as e:
            print(f"Youdao API error: {e}")

        return None

    def _parse_youdao_response(self, data: dict) -> Dict[str, Any]:
        """解析有道 API 响应"""
        basic = data.get("basic", {})

        # 提取音标
        phonetic_us = basic.get("us-phonetic", "")
        phonetic_uk = basic.get("uk-phonetic", "")

        # 提取释义
        explains = basic.get("explains", [])
        chinese_meaning = "；".join(explains) if explains else ""

        # 提取例句
        web_trans = data.get("web", [])
        example_sentence = ""
        example_translation = ""
        if web_trans:
            example_sentence = web_trans[0].get("key", "")
            example_translation = "；".join(web_trans[0].get("value", []))

        return {
            "english_word": data.get("query", ""),
            "chinese_meaning": chinese_meaning,
            "phonetic_us": phonetic_us,
            "phonetic_uk": phonetic_uk,
            "example_sentence": example_sentence,
            "example_translation": example_translation
        }

    def _mock_data(self, english_word: str) -> Dict[str, Any]:
        """生成 Mock 数据"""
        # 这里可以扩展一个简单的本地词典
        # 或者返回基本数据让用户手动补充
        return {
            "english_word": english_word,
            "chinese_meaning": "请补充释义",
            "phonetic_us": "",
            "phonetic_uk": "",
            "example_sentence": "",
            "example_translation": ""
        }


# 本地词典数据（可以扩展）
LOCAL_DICT = {
    "cup": {
        "chinese_meaning": "n. 杯子；奖杯；一杯",
        "phonetic_us": "/kʌp/",
        "phonetic_uk": "/kʌp/",
        "example_sentence": "Would you like a cup of coffee?",
        "example_translation": "你想来杯咖啡吗？"
    },
    "laptop": {
        "chinese_meaning": "n. 笔记本电脑",
        "phonetic_us": "/ˈlæptɑːp/",
        "phonetic_uk": "/ˈlæptɒp/",
        "example_sentence": "I work on my laptop every day.",
        "example_translation": "我每天用笔记本电脑工作。"
    },
    "book": {
        "chinese_meaning": "n. 书籍；著作",
        "phonetic_us": "/bʊk/",
        "phonetic_uk": "/bʊk/",
        "example_sentence": "This is an interesting book.",
        "example_translation": "这是一本有趣的书。"
    },
    "bottle": {
        "chinese_meaning": "n. 瓶子；一瓶",
        "phonetic_us": "/ˈbɑːtl/",
        "phonetic_uk": "/ˈbɒtl/",
        "example_sentence": "Pass me the water bottle.",
        "example_translation": "把水瓶递给我。"
    },
    "person": {
        "chinese_meaning": "n. 人；个人",
        "phonetic_us": "/ˈpɜːrsn/",
        "phonetic_uk": "/ˈpɜːsn/",
        "example_sentence": "She is a very nice person.",
        "example_translation": "她是一个非常好的人。"
    }
}


def get_local_dict(word: str) -> Optional[Dict[str, Any]]:
    """从本地词典获取单词数据"""
    word_lower = word.lower()
    if word_lower in LOCAL_DICT:
        return {
            "english_word": word,
            **LOCAL_DICT[word_lower]
        }
    return None
