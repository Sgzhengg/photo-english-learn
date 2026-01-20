"""
Redis 缓存管理模块
提供统一的缓存接口，支持多种缓存策略
"""
import json
import logging
from typing import Optional, Any, Callable
from functools import wraps
import redis.asyncio as redis
from datetime import timedelta

logger = logging.getLogger(__name__)


class RedisCache:
    """Redis 缓存客户端"""

    def __init__(self, redis_url: str):
        """
        初始化 Redis 客户端

        Args:
            redis_url: Redis 连接 URL，如 redis://localhost:6379
        """
        self.redis_url = redis_url
        self._client: Optional[redis.Redis] = None

    async def get_client(self) -> redis.Redis:
        """获取 Redis 客户端（懒加载）"""
        if self._client is None:
            try:
                self._client = redis.from_url(
                    self.redis_url,
                    encoding="utf-8",
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5,
                    retry_on_timeout=True
                )
                # 测试连接
                await self._client.ping()
                logger.info(f"Redis 连接成功: {self.redis_url}")
            except Exception as e:
                logger.warning(f"Redis 连接失败: {e}")
                self._client = None
        return self._client

    async def is_available(self) -> bool:
        """检查 Redis 是否可用"""
        try:
            client = await self.get_client()
            if client:
                await client.ping()
                return True
        except Exception as e:
            logger.debug(f"Redis 不可用: {e}")
        return False

    async def get(self, key: str) -> Optional[Any]:
        """
        从缓存获取数据

        Args:
            key: 缓存键

        Returns:
            缓存的值，如果不存在或出错返回 None
        """
        try:
            client = await self.get_client()
            if not client:
                return None

            value = await client.get(key)
            if value:
                # 尝试解析 JSON
                try:
                    return json.loads(value)
                except json.JSONDecodeError:
                    return value
            return None
        except Exception as e:
            logger.warning(f"缓存读取失败 [{key}]: {e}")
            return None

    async def set(
        self,
        key: str,
        value: Any,
        expire_seconds: Optional[int] = None
    ) -> bool:
        """
        设置缓存

        Args:
            key: 缓存键
            value: 缓存值（自动序列化为 JSON）
            expire_seconds: 过期时间（秒），None 表示不过期

        Returns:
            是否成功
        """
        try:
            client = await self.get_client()
            if not client:
                return False

            # 序列化值
            if not isinstance(value, (str, int, float, bool)):
                value = json.dumps(value, ensure_ascii=False)

            if expire_seconds:
                await client.setex(key, expire_seconds, value)
            else:
                await client.set(key, value)

            return True
        except Exception as e:
            logger.warning(f"缓存设置失败 [{key}]: {e}")
            return False

    async def delete(self, *keys: str) -> bool:
        """
        删除缓存

        Args:
            *keys: 要删除的缓存键

        Returns:
            是否成功
        """
        try:
            client = await self.get_client()
            if not client:
                return False

            if keys:
                await client.delete(*keys)
            return True
        except Exception as e:
            logger.warning(f"缓存删除失败 {keys}: {e}")
            return False

    async def exists(self, *keys: str) -> bool:
        """
        检查键是否存在

        Args:
            *keys: 要检查的缓存键

        Returns:
            是否存在
        """
        try:
            client = await self.get_client()
            if not client:
                return False

            if keys:
                return await client.exists(*keys) > 0
            return False
        except Exception as e:
            logger.debug(f"缓存存在检查失败 {keys}: {e}")
            return False

    async def close(self):
        """关闭 Redis 连接"""
        if self._client:
            await self._client.close()
            self._client = None


# 全局缓存实例
_cache_instance: Optional[RedisCache] = None


def get_cache() -> Optional[RedisCache]:
    """
    获取全局缓存实例（单例模式）

    Returns:
        RedisCache 实例，如果未初始化返回 None
    """
    return _cache_instance


def init_cache(redis_url: str):
    """
    初始化全局缓存实例

    Args:
        redis_url: Redis 连接 URL
    """
    global _cache_instance
    _cache_instance = RedisCache(redis_url)


# 缓存装饰器
def cached(
    key_prefix: str,
    expire_seconds: int = 3600,
    arg_builder: Optional[Callable] = None
):
    """
    缓存装饰器

    Args:
        key_prefix: 缓存键前缀
        expire_seconds: 过期时间（秒），默认 1 小时
        arg_builder: 自定义键构建函数，接收函数参数返回键的一部分

    Example:
        @cached("word_lookup", expire_seconds=86400)  # 24 小时
        async def lookup_word(word: str):
            ...

        @cached("scene_objects", expire_seconds=604800)  # 7 天
        async def get_scene_objects(scene_id: int):
            ...
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 尝试从缓存获取
            cache = get_cache()
            if cache and await cache.is_available():
                try:
                    # 构建缓存键
                    if arg_builder:
                        key_suffix = arg_builder(*args, **kwargs)
                    else:
                        # 默认使用参数字符串
                        key_suffix = "_".join(str(arg) for arg in args)
                        if kwargs:
                            key_suffix += "_" + "_".join(f"{k}={v}" for k, v in sorted(kwargs.items()))

                    cache_key = f"{key_prefix}:{key_suffix}"

                    # 尝试从缓存获取
                    cached_value = await cache.get(cache_key)
                    if cached_value is not None:
                        logger.debug(f"缓存命中: {cache_key}")
                        return cached_value

                    # 缓存未命中，执行函数
                    logger.debug(f"缓存未命中: {cache_key}")
                    result = await func(*args, **kwargs)

                    # 存入缓存
                    await cache.set(cache_key, result, expire_seconds)
                    return result

                except Exception as e:
                    logger.warning(f"缓存操作失败: {e}")

            # Redis 不可用或出错，直接执行函数
            return await func(*args, **kwargs)

        return wrapper
    return decorator


# 预定义的缓存策略
class CachePolicy:
    """缓存策略常量"""

    # 单词查询缓存（高频访问，变化少）
    WORD_LOOKUP_TTL = 86400  # 24 小时

    # 场景识别结果缓存（中等频率）
    SCENE_ANALYSIS_TTL = 604800  # 7 天

    # 场景描述缓存（低频率）
    SCENE_DESCRIPTION_TTL = 604800  # 7 天

    # 例句生成缓存（中等频率）
    SENTENCE_GENERATION_TTL = 86400  # 24 小时

    # 用户生词列表缓存（短时间，因为会频繁更新）
    USER_WORD_LIST_TTL = 300  # 5 分钟

    # 复习列表缓存（短时间）
    REVIEW_LIST_TTL = 600  # 10 分钟

    # 标签列表缓存（长时间，很少变化）
    TAGS_LIST_TTL = 86400  # 24 小时
