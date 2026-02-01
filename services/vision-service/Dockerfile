# Vision Service - Optimized Dockerfile for Zeabur
# 确保所有依赖正确安装，避免部署失败

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

# ==================== 安装 Python 依赖 ====================
# 优先使用完整的依赖文件，如果不存在则回退到分层文件
COPY requirements*.txt ./

# 尝试安装完整依赖文件（如果存在）
RUN if [ -f requirements-full.txt ]; then \
      echo "Installing from requirements-full.txt..."; \
      pip install --no-cache-dir -r requirements-full.txt; \
    else \
      echo "Installing from layered requirements..."; \
      pip install --no-cache-dir -r requirements-base.txt && \
      pip install --no-cache-dir -r requirements-ml.txt && \
      pip install --no-cache-dir -r requirements.txt; \
    fi

# ==================== 复制代码 ====================
COPY . .

# ==================== 预下载 YOLO 模型（可选）====================
# 创建模型目录
RUN mkdir -p /app/models

# 尝试预下载模型（如果失败也不会影响部署）
RUN python -c "from ultralytics import YOLO; YOLO('yolov8n.pt'); import shutil; shutil.move('yolov8n.pt', '/app/models/')" 2>/dev/null || echo "Model pre-download skipped, will download on first use"

# 设置 Python 路径（支持 shared 模块）
ENV PYTHONPATH="/app:$PYTHONPATH"

# 设置模型路径环境变量
ENV YOLO_MODEL_PATH="/app/models/yolov8n.pt"

# 暴露端口
EXPOSE 8003

# 启动服务
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
