# Vision Service - Optimized Dockerfile for Zeabur
# 多阶段构建 + 层缓存优化，加快部署速度

FROM python:3.11-slim

LABEL "language"="python"
LABEL "framework"="fastapi"

WORKDIR /app

# 安装系统依赖（合并层，减少镜像大小）
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libgomp1 \
    libgl1-mesa-glx \
    libglib2.0-0 \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 升级 pip
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# ==================== 关键优化：分层安装依赖 ====================
# 第一层：基础依赖（很少变化，会被缓存）
COPY services/vision-service/requirements-base.txt .
RUN pip install --no-cache-dir -r requirements-base.txt

# 第二层：ML 依赖（偶尔变化，会被缓存）
# 使用 opencv-python-headless 而不是 opencv-python（小约 200MB）
COPY services/vision-service/requirements-ml.txt .
RUN pip install --no-cache-dir -r requirements-ml.txt

# 第三层：应用依赖（经常变化）
COPY services/vision-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ==================== 预下载 YOLO 模型 ====================
# 创建模型目录
RUN mkdir -p /app/models

# 预下载 YOLOv8n 模型（只在首次构建时下载，后续利用缓存）
COPY services/vision-service/download_model.py .
RUN python download_model.py && rm download_model.py

# 复制所有代码（包括 shared）
COPY shared ./shared/
COPY services/vision-service/ ./vision-service/

# 设置工作目录到服务目录
WORKDIR /app/vision-service

# 设置 Python 路径
ENV PYTHONPATH="/app:$PYTHONPATH"

# 设置模型路径环境变量
ENV YOLO_MODEL_PATH="/app/models/yolov8n.pt"

# 暴露端口
EXPOSE 8003

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8003/')" || exit 1

# 启动服务
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
