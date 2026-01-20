"""
请求限流中间件
防止 API 滥用，基于用户 ID 或 IP 地址进行限流
"""
import time
import logging
from typing import Optional
from fastapi import Request, HTTPException, status
from functools import wraps

logger = logging.getLogger(__name__)


class RateLimiter:
    """基于 Redis 的限流器"""

    def __init__(self):
        """初始化限流器"""
        self._cache = None

    async def _get_cache(self):
        """获取缓存客户端（懒加载）"""
        if self._cache is None:
            try:
                from shared.utils.cache import get_cache
                self._cache = get_cache()
            except Exception as e:
                logger.warning(f"获取缓存客户端失败: {e}")
        return self._cache

    async def is_allowed(
        self,
        key: str,
        max_requests: int,
        window_seconds: int
    ) -> bool:
        """
        检查是否允许请求

        Args:
            key: 限流键（如 user_id 或 IP）
            max_requests: 时间窗口内最大请求数
            window_seconds: 时间窗口（秒）

        Returns:
            是否允许请求
        """
        cache = await self._get_cache()

        if not cache or not await cache.is_available():
            # Redis 不可用时不限流
            return True

        try:
            cache_key = f"rate_limit:{key}"
            current = await cache.get(cache_key)

            if current is None:
                # 首次请求
                await cache.set(cache_key, 1, window_seconds)
                return True

            # 检查是否超过限制
            if isinstance(current, int) and current >= max_requests:
                logger.warning(f"请求限流触发: {key} (已请求 {current}/{max_requests})")
                return False

            # 增加计数
            await cache.set(cache_key, current + 1, window_seconds)
            return True

        except Exception as e:
            logger.warning(f"限流检查失败: {e}")
            # 出错时不限流
            return True

    async def get_remaining_requests(
        self,
        key: str
    ) -> Optional[int]:
        """
        获取剩余请求数

        Args:
            key: 限流键

        Returns:
            剩余请求数，如果无法获取返回 None
        """
        cache = await self._get_cache()

        if not cache or not await cache.is_available():
            return None

        try:
            cache_key = f"rate_limit:{key}"
            current = await cache.get(cache_key)
            return current
        except Exception:
            return None


# 全局限流器实例
_rate_limiter = RateLimiter()


def rate_limit(
    max_requests: int = 60,
    window_seconds: int = 60,
    key_func: Optional[callable] = None
):
    """
    请求限流装饰器

    Args:
        max_requests: 时间窗口内最大请求数（默认 60 次/分钟）
        window_seconds: 时间窗口（秒，默认 60 秒）
        key_func: 自定义键生成函数，接收 Request 返回限流键

    Example:
        @app.get("/api/endpoint")
        @rate_limit(max_requests=10, window_seconds=60)
        async def endpoint():
            return {"message": "Hello"}

        # 限制特定用户
        @app.get("/api/premium")
        @rate_limit(max_requests=1000, window_seconds=60)
        async def premium_endpoint():
            return {"message": "Premium"}
    """
    def decorator(func: callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 尝试从参数中获取 Request
            request = None
            for arg in args:
                if isinstance(arg, Request):
                    request = arg
                    break

            # 如果没有 Request，检查 kwargs
            if not request:
                request = kwargs.get('request')

            if request:
                # 生成限流键
                if key_func:
                    limit_key = key_func(request)
                else:
                    # 默认使用用户 ID（如果已认证）或 IP 地址
                    limit_key = _get_default_key(request)

                # 检查是否允许请求
                allowed = await _rate_limiter.is_allowed(
                    limit_key,
                    max_requests,
                    window_seconds
                )

                if not allowed:
                    # 获取剩余时间
                    remaining = await _rate_limiter.get_remaining_requests(limit_key)
                    retry_after = window_seconds

                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail={
                            "error": "Too many requests",
                            "message": f"请求过于频繁，请在 {retry_after} 秒后重试",
                            "retry_after": retry_after
                        },
                        headers={
                            "Retry-After": str(retry_after),
                            "X-RateLimit-Limit": str(max_requests),
                            "X-RateLimit-Remaining": "0",
                            "X-RateLimit-Reset": str(int(time.time()) + retry_after)
                        }
                    )

                # 添加限流信息到响应头
                remaining_count = await _rate_limiter.get_remaining_requests(limit_key)
                if remaining_count is not None:
                    # 这里无法直接修改响应头，需要在 middleware 层处理
                    pass

            return await func(*args, **kwargs)

        return wrapper
    return decorator


def _get_default_key(request: Request) -> str:
    """
    生成默认限流键

    优先级：
    1. 用户 ID（如果已认证）
    2. IP 地址
    """
    # 尝试从请求状态中获取用户信息
    if hasattr(request.state, 'user') and request.state.user:
        return f"user:{request.state.user.user_id}"

    # 使用 IP 地址
    # 获取真实 IP（考虑代理）
    forwarded = request.headers.get('X-Forwarded-For')
    if forwarded:
        ip = forwarded.split(',')[0].strip()
    else:
        ip = request.client.host if request.client else 'unknown'

    return f"ip:{ip}"


class RateLimitMiddleware:
    """
    请求限流中间件（全局应用）

    在 FastAPI 应用中添加：
    app.add_middleware(RateLimitMiddleware)
    """

    def __init__(
        self,
        max_requests: int = 60,
        window_seconds: int = 60,
        exclude_paths: Optional[list] = None
    ):
        """
        初始化中间件

        Args:
            max_requests: 时间窗口内最大请求数
            window_seconds: 时间窗口（秒）
            exclude_paths: 排除的路径列表（不限流）
        """
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.exclude_paths = exclude_paths or ["/", "/health", "/docs", "/openapi.json", "/redoc"]

    async def __call__(self, request: Request, call_next):
        """处理请求"""
        # 检查是否需要限流
        if request.url.path in self.exclude_paths:
            return await call_next(request)

        # 生成限流键
        limit_key = _get_default_key(request)

        # 检查是否允许请求
        allowed = await _rate_limiter.is_allowed(
            limit_key,
            self.max_requests,
            self.window_seconds
        )

        if not allowed:
            retry_after = self.window_seconds
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "code": -1,
                    "message": "Too many requests",
                    "data": {
                        "error": "请求过于频繁",
                        "retry_after": retry_after
                    }
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(self.max_requests),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(time.time()) + retry_after)
                }
            )

        # 处理请求
        response = await call_next(request)

        # 添加限流信息到响应头
        remaining = await _rate_limiter.get_remaining_requests(limit_key)
        if remaining is not None:
            response.headers["X-RateLimit-Limit"] = str(self.max_requests)
            response.headers["X-RateLimit-Remaining"] = str(max(0, self.max_requests - remaining))
            response.headers["X-RateLimit-Reset"] = str(int(time.time()) + self.window_seconds)

        return response


from fastapi.responses import JSONResponse


# 预定义的限流策略
class RateLimitPolicy:
    """限流策略常量"""

    # 全局默认限制
    DEFAULT = (60, 60)  # 60 次/分钟

    # 认证相关（低频）
    AUTH = (10, 60)  # 10 次/分钟

    # API 查询（中频）
    API_QUERY = (120, 60)  # 120 次/分钟

    # 写操作（低频）
    WRITE_OPERATION = (20, 60)  # 20 次/分钟

    # 昂贵操作（极低频）
    EXPENSIVE = (5, 60)  # 5 次/分钟


# 为特定端点添加限流的便捷函数
def limit_auth(max_requests: int = 10, window_seconds: int = 60):
    """认证端点限流"""
    return rate_limit(max_requests, window_seconds)


def limit_api(max_requests: int = 120, window_seconds: int = 60):
    """API 查询限流"""
    return rate_limit(max_requests, window_seconds)


def limit_write(max_requests: int = 20, window_seconds: int = 60):
    """写操作限流"""
    return rate_limit(max_requests, window_seconds)


def limit_expensive(max_requests: int = 5, window_seconds: int = 60):
    """昂贵操作限流（如图片分析）"""
    return rate_limit(max_requests, window_seconds)
