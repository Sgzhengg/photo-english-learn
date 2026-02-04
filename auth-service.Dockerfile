# Auth Service - Zeabur Dockerfile
FROM python:3.11-slim

LABEL "language"="python"
LABEL "framework"="fastapi"

WORKDIR /app

# 安装依赖（分层缓存：只在 requirements.txt 变化时重新安装依赖）
COPY services/auth-service/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 复制所有代码（包括 shared）
COPY shared ./shared/
COPY services/auth-service/ ./auth-service/

# 设置工作目录到服务目录
WORKDIR /app/auth-service

# 设置 Python 路径
ENV PYTHONPATH="/app:$PYTHONPATH"

# 暴露端口
EXPOSE 8001

# 启动服务
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
