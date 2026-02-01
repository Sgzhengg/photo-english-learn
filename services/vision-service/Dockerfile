# Vision Service - Zeabur 优化 Dockerfile
# 基于 Zeabur AI 诊断建议优化

FROM python:3.11-slim

LABEL "language"="python"
LABEL "framework"="fastapi"

WORKDIR /app

# 安装系统依赖
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

# ==================== 关键优化：先复制依赖，再复制代码 ====================
# 这样代码变化时不需要重新安装依赖（利用 Docker 层缓存）
COPY requirements*.txt ./

# 安装 Python 依赖（使用 pip 缓存加速）
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements-full.txt

# ==================== 最后复制代码 ====================
# 代码变化不会触发依赖重新安装
COPY . .

# ==================== 预下载 YOLO 模型 ====================
RUN mkdir -p /app/models
RUN python -c "from ultralytics import YOLO; YOLO('yolov8n.pt'); import shutil; shutil.move('yolov8n.pt', '/app/models/')" 2>/dev/null || echo "Model will download on first use"

# 设置 Python 路径
ENV PYTHONPATH="/app:$PYTHONPATH"
ENV YOLO_MODEL_PATH="/app/models/yolov8n.pt"

# 暴露端口
EXPOSE 8003

# 启动服务
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
