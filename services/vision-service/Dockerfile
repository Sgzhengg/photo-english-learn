# Vision Service - 轻量级 Dockerfile（使用 OpenRouter GPT-4o-mini）
# 无需 PyTorch、OpenCV 等庞大依赖，镜像大小从 1.5GB 降至 ~150MB

FROM python:3.11-slim

LABEL "language"="python"
LABEL "framework"="fastapi"
LABEL "provider"="OpenRouter"
LABEL "model" "GPT-4o-mini"

WORKDIR /app

# 安装系统依赖（无需 ML 库依赖）
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 升级 pip
RUN pip install --upgrade pip setuptools wheel

# ==================== 关键优化：先复制依赖，再复制代码 ====================
# 使用 requirements-deploy.txt 避免层缓存问题
COPY requirements-deploy.txt ./

# 安装 Python 依赖（强制重新构建）
# 构建时间戳：2025-02-02-v2
RUN pip install --no-cache-dir -r requirements-deploy.txt && \
    echo "✓ Dependencies installed successfully" && \
    python -c "import uvicorn; print(f'✓ uvicorn version: {uvicorn.__version__}')" && \
    python -c "import fastapi; print(f'✓ fastapi version: {fastapi.__version__}')" && \
    python -c "import openai; print(f'✓ openai version: {openai.__version__}')"

# ==================== 复制代码 ====================
COPY . .

# 设置 Python 路径
ENV PYTHONPATH="/app:$PYTHONPATH"

# 环境变量（需要在 Zeabur 控制台配置）
# - OPENROUTER_API_KEY: OpenRouter API 密钥（必需）
# - DATABASE_URL: PostgreSQL 连接字符串
# - REDIS_URL: Redis 连接字符串

# 暴露端口
EXPOSE 8003

# 启动服务
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
