"""
API Gateway - API网关服务
统一入口，代理所有后端服务请求
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import httpx
import os
import json
from typing import Dict, Tuple
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 初始化 FastAPI 应用
app = FastAPI(
    title="API Gateway",
    description="API网关 - 统一入口代理所有服务",
    version="1.0.0"
)

# CORS 配置 - 允许所有前端域名
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*",  # 允许所有来源（生产环境应该限制）
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 后端服务 URLs (从环境变量获取，使用默认值)
# 生产环境使用 Zeabur 内网地址以提高性能和稳定性
SERVICE_URLS = {
    "auth": os.getenv("AUTH_SERVICE_URL", "http://auth-service.zeabur.internal:8001"),
    "vision": os.getenv("VISION_SERVICE_URL", "http://vision-service.zeabur.internal:8003"),
    "word": os.getenv("WORD_SERVICE_URL", "http://word-service.zeabur.internal:8004"),
    "practice": os.getenv("PRACTICE_SERVICE_URL", "http://practice-service.zeabur.internal:8005"),
    "tts": os.getenv("TTS_SERVICE_URL", "http://tts-service.zeabur.internal:8006"),
    "asr": os.getenv("ASR_SERVICE_URL", "http://asr-service.zeabur.internal:8080"),
}

# 路由前缀映射
ROUTE_PREFIXES = {
    "auth": ["/auth", "/register", "/login", "/refresh", "/me", "/user"],
    "vision": ["/photo", "/vision", "/analyze", "/scenes", "/objects"],  # 添加 /photo
    "word": ["/word", "/words", "/tags", "/vocabulary"],  # 添加 /vocabulary
    "practice": ["/practice", "/generate", "/sentences", "/review", "/progress"],
    "tts": ["/tts", "/synthesize", "/voices"],
    "asr": ["/asr", "/recognize", "/speech"],
}

# 不移除前缀的路由（保留完整路径）
PRESERVE_PREFIX_ROUTES = ["/user", "/photo", "/vocabulary"]


def determine_service(path: str) -> Tuple[str, str]:
    """根据路径确定目标服务，返回 (服务名, 去掉前缀后的路径)"""
    path = path.lower()
    original_path = path

    # 精确匹配和前缀匹配
    for service, prefixes in ROUTE_PREFIXES.items():
        for prefix in prefixes:
            if path == prefix:
                # 精确匹配前缀，返回根路径
                return service, "/"
            elif path.startswith(prefix + "/"):
                # 检查是否需要保留完整路径
                if prefix in PRESERVE_PREFIX_ROUTES:
                    # 对于 /user 等前缀，保留完整路径（path 已经以 / 开头）
                    return service, path
                else:
                    # 路径以该前缀开头，去掉前缀
                    return service, path[len(prefix):]

    # 默认返回 auth，保持原路径
    return "auth", "/" + original_path


@app.get("/")
async def root():
    """网关健康检查"""
    return {
        "code": 0,
        "message": "API Gateway is running",
        "data": {
            "service": "api-gateway",
            "services": list(SERVICE_URLS.keys()),
            "status": "healthy"
        }
    }


@app.get("/health")
async def health_check():
    """检查所有后端服务的健康状态"""
    results = {}
    async with httpx.AsyncClient(timeout=10.0) as client:
        for service_name, service_url in SERVICE_URLS.items():
            try:
                response = await client.get(f"{service_url}/")
                results[service_name] = {
                    "status": "healthy" if response.status_code == 200 else "unhealthy",
                    "url": service_url,
                    "response_time": response.elapsed.total_seconds()
                }
            except Exception as e:
                results[service_name] = {
                    "status": "down",
                    "url": service_url,
                    "error": str(e)
                }

    return {
        "code": 0,
        "message": "Health check completed",
        "data": results
    }


@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy_request(path: str, request: Request):
    """
    代理所有请求到相应的后端服务

    路由规则:
    - /register, /login, /refresh, /me -> auth service
    - /analyze, /scenes, /objects -> vision service
    - /word, /words, /tags -> word service
    - /generate, /sentences, /review, /progress -> practice service
    - /synthesize, /voices -> tts service
    - /asr/* -> asr service
    """
    # 确定目标服务和转发路径
    service_name, proxy_path = determine_service("/" + path)
    service_url = SERVICE_URLS.get(service_name)

    if not service_url:
        raise HTTPException(status_code=503, detail=f"Service {service_name} not configured")

    # 构建目标URL（使用去掉前缀后的路径）
    target_url = f"{service_url}{proxy_path}"

    logger.info(f"Proxying {request.method} /{path} -> {service_name} service ({proxy_path})")

    try:
        # vision 服务需要处理图像，设置60秒超时
        # 其他服务保持30秒
        timeout = 60.0 if service_name == "vision" else 30.0
        async with httpx.AsyncClient(timeout=timeout) as client:
            # 转发请求
            response = await client.request(
                method=request.method,
                url=target_url,
                headers={k: v for k, v in request.headers.items() if k.lower() != "host"},
                content=await request.body(),
                params=request.query_params
            )

            # 尝试解析 JSON 响应
            try:
                response_data = response.json()
            except (json.JSONDecodeError, ValueError):
                # 如果响应不是有效的 JSON，返回错误响应
                logger.warning(f"Non-JSON response from {service_name}: {response.text[:200]}")
                response_data = {
                    "code": -1,
                    "message": f"{service_name} 服务返回了无效的响应格式",
                    "data": None
                }

            # 返回响应
            return JSONResponse(
                content=response_data,
                status_code=response.status_code,
                headers=dict(response.headers)
            )

    except httpx.TimeoutException:
        logger.error(f"Timeout proxying to {service_name} service")
        return JSONResponse(
            status_code=504,
            content={
                "code": -1,
                "message": f"请求超时：{service_name} 服务响应时间过长",
                "data": None
            }
        )

    except httpx.HTTPError as e:
        logger.error(f"HTTP error proxying to {service_name}: {e}")
        return JSONResponse(
            status_code=502,
            content={
                "code": -1,
                "message": f"无法连接到 {service_name} 服务",
                "data": {"error": str(e)}
            }
        )

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return JSONResponse(
            status_code=500,
            content={
                "code": -1,
                "message": "网关内部错误",
                "data": {"error": str(e)}
            }
        )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理"""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "code": -1,
            "message": "服务器内部错误",
            "data": {"detail": str(exc)}
        }
    )


# Mount static files for frontend (SPA support)
frontend_dist_path = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist_path.exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist_path / "assets")), name="assets")
    app.mount("/", StaticFiles(directory=str(frontend_dist_path), html=True), name="frontend")
    logger.info(f"Frontend static files mounted from: {frontend_dist_path}")
else:
    logger.warning(f"Frontend dist directory not found at: {frontend_dist_path}")
    logger.info("API Gateway running in API-only mode (no frontend)")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
