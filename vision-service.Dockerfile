# Vision Service - Zeabur Dockerfile (Optimized)
FROM python:3.11-slim

LABEL "language"="python"
LABEL "framework"="fastapi"

WORKDIR /app

# 复制优化的 requirements 并安装（分层缓存）
COPY services/vision-service/requirements-deploy.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements-deploy.txt

# 复制所有代码（包括 shared）
COPY shared ./shared/
COPY services/vision-service/ ./vision-service/

# 设置工作目录到服务目录
WORKDIR /app/vision-service

# 设置 Python 路径
ENV PYTHONPATH="/app:$PYTHONPATH"

# 暴露端口
EXPOSE 8003

# 启动服务
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
