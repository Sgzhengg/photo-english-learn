# Vision Service - Optimized Dockerfile for Zeabur
# 使用 pip 缓存和最小依赖，大幅减少构建时间

FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    # 启用 pip 缓存以加速构建
    PIP_CACHE_DIR=/root/.cache/pip

WORKDIR /app

# 只安装必要的系统依赖
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 复制依赖文件（利用 Docker 缓存层）
COPY requirements-deploy.txt .

# 一次性安装所有 Python 依赖（利用 Zeabur pip 缓存）
RUN pip install --no-cache-dir -r requirements-deploy.txt

# 复制应用代码
COPY . .

# 设置 Python 路径
ENV PYTHONPATH="/app:$PYTHONPATH"

# 暴露端口
EXPOSE 8003

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8003/ || exit 1

# 运行应用
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
