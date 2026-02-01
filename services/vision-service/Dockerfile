# Vision Service - 轻量级 Dockerfile（使用 OpenRouter GPT-4o-mini）
# 无需 PyTorch、OpenCV 等庞大依赖，镜像大小从 1.5GB 降至 ~150MB

FROM python:3.11-slim

LABEL "language"="python"
LABEL "framework"="fastapi"
LABEL "provider"="OpenRouter"
LABEL "model"="GPT-4o-mini"
LABEL "build_timestamp"="2025-02-02-15-30"

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 升级 pip 并直接安装核心依赖（避免 requirements 文件缓存问题）
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir \
    fastapi==0.115.0 \
    uvicorn[standard]==0.32.0 \
    pydantic==2.9.2 \
    pydantic-settings==2.6.0 \
    python-dotenv==1.0.1

# 安装其他依赖
COPY requirements-deploy.txt ./
RUN pip install --no-cache-dir -r requirements-deploy.txt && \
    echo "✓ All dependencies installed" && \
    python -c "import uvicorn; print(f'✓ uvicorn {uvicorn.__version__}')" && \
    python -c "import fastapi; print(f'✓ fastapi {fastapi.__version__}')"

# 复制代码
COPY . .

# 设置 Python 路径
ENV PYTHONPATH="/app:$PYTHONPATH"

# 暴露端口
EXPOSE 8003

# 启动服务
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
