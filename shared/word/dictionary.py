"""
词典 API - 查询单词信息
"""
from typing import Optional, Dict, Any
import httpx
import os
import logging

logger = logging.getLogger(__name__)


class DictionaryAPI:
    """词典 API 类"""

    def __init__(self):
        self.api_key = os.getenv("YOUDAO_API_KEY") or os.getenv("DICT_API_KEY")
        self.base_url = "https://openapi.youdao.com/api"

    async def lookup(self, english_word: str) -> Optional[Dict[str, Any]]:
        """
        查询单词（优化版：本地词典优先，提升速度）

        Args:
            english_word: 英文单词

        Returns:
            单词信息字典
        """
        # 1. 优先使用本地词典（最快，<1ms）
        word_data = get_local_dict(english_word)
        if word_data:
            logger.info(f"✅ 单词从本地词典获取: {english_word}")
            return word_data

        # 2. 使用快速免费API（MyMemory，超时3秒）
        word_data = await self._fetch_from_free_translation(english_word, timeout=3.0)
        if word_data:
            logger.info(f"✅ 单词从免费API获取: {english_word}")
            return word_data

        # 3. 备用：有道API（如果配置了密钥）
        word_data = await self._fetch_from_youdao(english_word)
        if word_data:
            logger.info(f"✅ 单词从有道API获取: {english_word}")
            return word_data

        # 4. 最后：使用Mock数据
        logger.warning(f"⚠️  单词查无结果，使用Mock: {english_word}")
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

    async def _fetch_from_free_translation(self, english_word: str, timeout: float = 3.0) -> Optional[Dict[str, Any]]:
        """从免费翻译API获取单词信息（MyMemory API，超时3秒优化）"""
        try:
            async with httpx.AsyncClient(timeout=timeout) as client:
                # MyMemory Translation API
                url = "https://api.mymemory.translated.net/get"
                params = {
                    "q": english_word,
                    "langpair": "en|zh-CN"
                }
                response = await client.get(url, params=params)
                data = response.json()

                if data.get("responseStatus") == 200:
                    translated_text = data.get("responseData", {}).get("translatedText", "")
                    if translated_text and translated_text != english_word:
                        return {
                            "english_word": english_word,
                            "chinese_meaning": translated_text,
                            "phonetic_us": "",
                            "phonetic_uk": "",
                            "example_sentence": "",
                            "example_translation": ""
                        }
        except Exception as e:
            logger.warning(f"Free translation API error: {e}")

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
        # 先尝试从本地词典获取
        local_data = get_local_dict(english_word)
        if local_data:
            return local_data

        # 如果本地词典也没有，返回基本数据让用户手动补充
        return {
            "english_word": english_word,
            "chinese_meaning": "请补充释义",
            "phonetic_us": "",
            "phonetic_uk": "",
            "example_sentence": "",
            "example_translation": ""
        }


# 本地词典数据（扩展版，覆盖100+常用词）
LOCAL_DICT = {
    # 饮品和食物
    "cup": {"chinese_meaning": "n. 杯子；奖杯；一杯", "phonetic_us": "/kʌp/", "phonetic_uk": "/kʌp/"},
    "glass": {"chinese_meaning": "n. 玻璃杯；镜子", "phonetic_us": "/ɡlæs/", "phonetic_uk": "/ɡlɑːs/"},
    "bottle": {"chinese_meaning": "n. 瓶子；一瓶", "phonetic_us": "/ˈbɑːtl/", "phonetic_uk": "/ˈbɒtl/"},
    "water": {"chinese_meaning": "n. 水；v. 浇水", "phonetic_us": "/ˈwɔːtər/", "phonetic_uk": "/ˈwɔːtə/"},
    "coffee": {"chinese_meaning": "n. 咖啡", "phonetic_us": "/ˈkɔːfi/", "phonetic_uk": "/ˈkɒfi/"},
    "tea": {"chinese_meaning": "n. 茶", "phonetic_us": "/tiː/", "phonetic_uk": "/tiː/"},
    "food": {"chinese_meaning": "n. 食物", "phonetic_us": "/fuːd/", "phonetic_uk": "/fuːd/"},
    "bread": {"chinese_meaning": "n. 面包", "phonetic_us": "/bred/", "phonetic_uk": "/bred/"},
    "fruit": {"chinese_meaning": "n. 水果", "phonetic_us": "/fruːt/", "phonetic_uk": "/fruːt/"},
    "apple": {"chinese_meaning": "n. 苹果", "phonetic_us": "/ˈæpl/", "phonetic_uk": "/ˈæpl/"},
    "banana": {"chinese_meaning": "n. 香蕉", "phonetic_us": "/bəˈnænə/", "phonetic_uk": "/bəˈnɑːnə/"},
    "egg": {"chinese_meaning": "n. 鸡蛋；蛋", "phonetic_us": "/eɡ/", "phonetic_uk": "/eɡ/"},

    # 电子产品
    "laptop": {"chinese_meaning": "n. 笔记本电脑", "phonetic_us": "/ˈlæptɑːp/", "phonetic_uk": "/ˈlæptɒp/"},
    "computer": {"chinese_meaning": "n. 电脑；计算机", "phonetic_us": "/kəmˈpjuːtər/", "phonetic_uk": "/kəmˈpjuːtə/"},
    "phone": {"chinese_meaning": "n. 电话；手机", "phonetic_us": "/foʊn/", "phonetic_uk": "/fəʊn/"},
    "keyboard": {"chinese_meaning": "n. 键盘", "phonetic_us": "/ˈkiːbɔːrd/", "phonetic_uk": "/ˈkiːbɔːd/"},
    "mouse": {"chinese_meaning": "n. 鼠标；老鼠", "phonetic_us": "/maʊs/", "phonetic_uk": "/maʊs/"},
    "screen": {"chinese_meaning": "n. 屏幕；屏幕", "phonetic_us": "/skriːn/", "phonetic_uk": "/skriːn/"},

    # 家具和日常用品
    "table": {"chinese_meaning": "n. 桌子；表格", "phonetic_us": "/ˈteɪbl/", "phonetic_uk": "/ˈteɪbl/"},
    "chair": {"chinese_meaning": "n. 椅子", "phonetic_us": "/tʃer/", "phonetic_uk": "/tʃeə/"},
    "desk": {"chinese_meaning": "n. 书桌；办公桌", "phonetic_us": "/desk/", "phonetic_uk": "/desk/"},
    "bed": {"chinese_meaning": "n. 床", "phonetic_us": "/bed/", "phonetic_uk": "/bed/"},
    "sofa": {"chinese_meaning": "n. 沙发", "phonetic_us": "/ˈsoʊfə/", "phonetic_uk": "/ˈsəʊfə/"},
    "lamp": {"chinese_meaning": "n. 灯", "phonetic_us": "/læmp/", "phonetic_uk": "/læmp/"},
    "clock": {"chinese_meaning": "n. 时钟；钟", "phonetic_us": "/klɑːk/", "phonetic_uk": "/klɒk/"},
    "book": {"chinese_meaning": "n. 书籍；著作", "phonetic_us": "/bʊk/", "phonetic_uk": "/bʊk/"},

    # 人物和动物
    "person": {"chinese_meaning": "n. 人；个人", "phonetic_us": "/ˈpɜːrsn/", "phonetic_uk": "/ˈpɜːsn/"},
    "people": {"chinese_meaning": "n. 人们；人", "phonetic_us": "/ˈpiːpl/", "phonetic_uk": "/ˈpiːpl/"},
    "child": {"chinese_meaning": "n. 孩子", "phonetic_us": "/tʃaɪld/", "phonetic_uk": "/tʃaɪld/"},
    "man": {"chinese_meaning": "n. 男人；人", "phonetic_us": "/mæn/", "phonetic_uk": "/mæn/"},
    "woman": {"chinese_meaning": "n. 女人；妇女", "phonetic_us": "/ˈwʊmən/", "phonetic_uk": "/ˈwʊmən/"},
    "cat": {"chinese_meaning": "n. 猫", "phonetic_us": "/kæt/", "phonetic_uk": "/kæt/"},
    "dog": {"chinese_meaning": "n. 狗", "phonetic_us": "/dɔːɡ/", "phonetic_uk": "/dɒɡ/"},
    "bird": {"chinese_meaning": "n. 鸟", "phonetic_us": "/bɜːrd/", "phonetic_uk": "/bɜːd/"},
    "fish": {"chinese_meaning": "n. 鱼；v. 捕鱼", "phonetic_us": "/fɪʃ/", "phonetic_uk": "/fɪʃ/"},

    # 学习用品
    "pen": {"chinese_meaning": "n. 钢笔；笔", "phonetic_us": "/pen/", "phonetic_uk": "/pen/"},
    "pencil": {"chinese_meaning": "n. 铅笔", "phonetic_us": "/ˈpensl/", "phonetic_uk": "/ˈpensl/"},
    "paper": {"chinese_meaning": "n. 纸；报纸", "phonetic_us": "/ˈpeɪpər/", "phonetic_uk": "/ˈpeɪpə/"},
    "notebook": {"chinese_meaning": "n. 笔记本；笔记本", "phonetic_us": "/ˈnoʊtbʊk/", "phonetic_uk": "/ˈnəʊtbʊk/"},
    "bag": {"chinese_meaning": "n. 包；袋子", "phonetic_us": "/bæɡ/", "phonetic_uk": "/bæɡ/"},

    # 交通工具
    "car": {"chinese_meaning": "n. 汽车；轿车", "phonetic_us": "/kɑːr/", "phonetic_uk": "/kɑː/"},
    "bus": {"chinese_meaning": "n. 公交车", "phonetic_us": "/bʌs/", "phonetic_uk": "/bʌs/"},
    "bike": {"chinese_meaning": "n. 自行车；摩托车", "phonetic_us": "/baɪk/", "phonetic_uk": "/baɪk/"},
    "bicycle": {"chinese_meaning": "n. 自行车", "phonetic_us": "/ˈbaɪsɪkl/", "phonetic_uk": "/ˈbaɪsɪkl/"},
    "train": {"chinese_meaning": "n. 火车；v. 训练", "phonetic_us": "/treɪn/", "phonetic_uk": "/treɪn/"},
    "plane": {"chinese_meaning": "n. 飞机", "phonetic_us": "/pleɪn/", "phonetic_uk": "/pleɪn/"},

    # 服装
    "shirt": {"chinese_meaning": "n. 衬衫", "phonetic_us": "/ʃɜːrt/", "phonetic_uk": "/ʃɜːt/"},
    "shoes": {"chinese_meaning": "n. 鞋子", "phonetic_us": "/ʃuːz/", "phonetic_uk": "/ʃuːz/"},
    "hat": {"chinese_meaning": "n. 帽子", "phonetic_us": "/hæt/", "phonetic_uk": "/hæt/"},
    "coat": {"chinese_meaning": "n. 外套；大衣", "phonetic_us": "/koʊt/", "phonetic_uk": "/kəʊt/"},

    # 自然和天气
    "tree": {"chinese_meaning": "n. 树；树木", "phonetic_us": "/triː/", "phonetic_uk": "/triː/"},
    "flower": {"chinese_meaning": "n. 花；花朵", "phonetic_us": "/ˈflaʊər/", "phonetic_uk": "/ˈflaʊə/"},
    "grass": {"chinese_meaning": "n. 草；草坪", "phonetic_us": "/ɡræs/", "phonetic_uk": "/ɡrɑːs/"},
    "sun": {"chinese_meaning": "n. 太阳", "phonetic_us": "/sʌn/", "phonetic_uk": "/sʌn/"},
    "moon": {"chinese_meaning": "n. 月亮", "phonetic_us": "/muːn/", "phonetic_uk": "/muːn/"},
    "star": {"chinese_meaning": "n. 星星；恒星", "phonetic_us": "/stɑːr/", "phonetic_uk": "/stɑː/"},
    "cloud": {"chinese_meaning": "n. 云；云朵", "phonetic_us": "/klaʊd/", "phonetic_uk": "/klaʊd/"},
    "rain": {"chinese_meaning": "n. 雨；v. 下雨", "phonetic_us": "/reɪn/", "phonetic_uk": "/reɪn/"},
    "snow": {"chinese_meaning": "n. 雪；v. 下雪", "phonetic_us": "/snoʊ/", "phonetic_uk": "/snəʊ/"},
    "wind": {"chinese_meaning": "n. 风；v. 吹", "phonetic_us": "/wɪnd/", "phonetic_uk": "/wɪnd/"},

    # 房屋和建筑
    "house": {"chinese_meaning": "n. 房子；住宅", "phonetic_us": "/haʊs/", "phonetic_uk": "/haʊs/"},
    "room": {"chinese_meaning": "n. 房间；室", "phonetic_us": "/ruːm/", "phonetic_uk": "/ruːm/"},
    "door": {"chinese_meaning": "n. 门；户", "phonetic_us": "/dɔːr/", "phonetic_uk": "/dɔː/"},
    "window": {"chinese_meaning": "n. 窗户；窗口", "phonetic_us": "/ˈwɪndoʊ/", "phonetic_uk": "/ˈwɪndəʊ/"},
    "building": {"chinese_meaning": "n. 建筑物；大楼", "phonetic_us": "/ˈbɪldɪŋ/", "phonetic_uk": "/ˈbɪldɪŋ/"},

    # 常用形容词
    "big": {"chinese_meaning": "adj. 大的；巨大的", "phonetic_us": "/bɪɡ/", "phonetic_uk": "/bɪɡ/"},
    "small": {"chinese_meaning": "adj. 小的；少的", "phonetic_us": "/smɔːl/", "phonetic_uk": "/smɔːl/"},
    "good": {"chinese_meaning": "adj. 好的；优秀的", "phonetic_us": "/ɡʊd/", "phonetic_uk": "/ɡʊd/"},
    "bad": {"chinese_meaning": "adj. 坏的；差的", "phonetic_us": "/bæd/", "phonetic_uk": "/bæd/"},
    "new": {"chinese_meaning": "adj. 新的；新鲜的", "phonetic_us": "/nuː/", "phonetic_uk": "/njuː/"},
    "old": {"chinese_meaning": "adj. 老的；旧的", "phonetic_us": "/oʊld/", "phonetic_uk": "/əʊld/"},
    "happy": {"chinese_meaning": "adj. 快乐的；幸福的", "phonetic_us": "/ˈhæpi/", "phonetic_uk": "/ˈhæpi/"},
    "sad": {"chinese_meaning": "adj. 悲伤的；难过的", "phonetic_us": "/sæd/", "phonetic_uk": "/sæd/"},

    # 常用动词
    "go": {"chinese_meaning": "v. 去；走", "phonetic_us": "/ɡoʊ/", "phonetic_uk": "/ɡəʊ/"},
    "come": {"chinese_meaning": "v. 来；来到", "phonetic_us": "/kʌm/", "phonetic_uk": "/kʌm/"},
    "eat": {"chinese_meaning": "v. 吃", "phonetic_us": "/iːt/", "phonetic_uk": "/iːt/"},
    "drink": {"chinese_meaning": "v. 喝；饮料", "phonetic_us": "/drɪŋk/", "phonetic_uk": "/drɪŋk/"},
    "sleep": {"chinese_meaning": "v. 睡觉；睡眠", "phonetic_us": "/sliːp/", "phonetic_uk": "/sliːp/"},
    "walk": {"chinese_meaning": "v. 走路；散步", "phonetic_us": "/wɔːk/", "phonetic_uk": "/wɔːk/"},
    "run": {"chinese_meaning": "v. 跑；跑步", "phonetic_us": "/rʌn/", "phonetic_uk": "/rʌn/"},
    "play": {"chinese_meaning": "v. 玩；播放", "phonetic_us": "/pleɪ/", "phonetic_uk": "/pleɪ/"},
    "work": {"chinese_meaning": "v. 工作；n. 作品", "phonetic_us": "/wɜːrk/", "phonetic_uk": "/wɜːk/"},
    "read": {"chinese_meaning": "v. 阅读；朗读", "phonetic_us": "/riːd/", "phonetic_uk": "/riːd/"},
    "write": {"chinese_meaning": "v. 写；写作", "phonetic_us": "/raɪt/", "phonetic_uk": "/raɪt/"},
    "watch": {"chinese_meaning": "v. 观看；手表", "phonetic_us": "/wɑːtʃ/", "phonetic_uk": "/wɒtʃ/"},
    "listen": {"chinese_meaning": "v. 听；倾听", "phonetic_us": "/ˈlɪsn/", "phonetic_uk": "/ˈlɪsn/"},
    "speak": {"chinese_meaning": "v. 说；说话", "phonetic_us": "/spiːk/", "phonetic_uk": "/spiːk/"},
    "learn": {"chinese_meaning": "v. 学习；了解", "phonetic_us": "/lɜːrn/", "phonetic_uk": "/lɜːn/"},
    "study": {"chinese_meaning": "v. 学习；n. 研究", "phonetic_us": "/ˈstʌdi/", "phonetic_uk": "/ˈstʌdi/"},
    "think": {"chinese_meaning": "v. 想；认为", "phonetic_us": "/θɪŋk/", "phonetic_uk": "/θɪŋk/"},

    # 数字
    "one": {"chinese_meaning": "num. 一", "phonetic_us": "/wʌn/", "phonetic_uk": "/wʌn/"},
    "two": {"chinese_meaning": "num. 二", "phonetic_us": "/tuː/", "phonetic_uk": "/tuː/"},
    "three": {"chinese_meaning": "num. 三", "phonetic_us": "/θriː/", "phonetic_uk": "/θriː/"},
    "four": {"chinese_meaning": "num. 四", "phonetic_us": "/fɔːr/", "phonetic_uk": "/fɔː/"},
    "five": {"chinese_meaning": "num. 五", "phonetic_us": "/faɪv/", "phonetic_uk": "/faɪv/"},
    "six": {"chinese_meaning": "num. 六", "phonetic_us": "/sɪks/", "phonetic_uk": "/sɪks/"},
    "seven": {"chinese_meaning": "num. 七", "phonetic_us": "/ˈsevn/", "phonetic_uk": "/ˈsevn/"},
    "eight": {"chinese_meaning": "num. 八", "phonetic_us": "/eɪt/", "phonetic_uk": "/eɪt/"},
    "nine": {"chinese_meaning": "num. 九", "phonetic_us": "/naɪn/", "phonetic_uk": "/naɪn/"},
    "ten": {"chinese_meaning": "num. 十", "phonetic_us": "/ten/", "phonetic_uk": "/ten/"},

    # 颜色
    "red": {"chinese_meaning": "adj. 红色的；n. 红色", "phonetic_us": "/red/", "phonetic_uk": "/red/"},
    "blue": {"chinese_meaning": "adj. 蓝色的；n. 蓝色", "phonetic_us": "/bluː/", "phonetic_uk": "/bluː/"},
    "green": {"chinese_meaning": "adj. 绿色的；n. 绿色", "phonetic_us": "/ɡriːn/", "phonetic_uk": "/ɡriːn/"},
    "yellow": {"chinese_meaning": "adj. 黄色的；n. 黄色", "phonetic_us": "/ˈjeloʊ/", "phonetic_uk": "/ˈjeləʊ/"},
    "white": {"chinese_meaning": "adj. 白色的；n. 白色", "phonetic_us": "/waɪt/", "phonetic_uk": "/waɪt/"},
    "black": {"chinese_meaning": "adj. 黑色的；n. 黑色", "phonetic_us": "/blæk/", "phonetic_uk": "/blæk/"},
}


def get_local_dict(word: str) -> Optional[Dict[str, Any]]:
    """从本地词典获取单词数据"""
    word_lower = word.lower()
    if word_lower in LOCAL_DICT:
        data = LOCAL_DICT[word_lower]
        return {
            "english_word": word,
            "chinese_meaning": data["chinese_meaning"],
            "phonetic_us": data["phonetic_us"],
            "phonetic_uk": data.get("phonetic_uk", data["phonetic_us"]),
            "example_sentence": "",
            "example_translation": ""
        }
    return None
