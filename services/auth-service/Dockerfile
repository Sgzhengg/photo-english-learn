# Auth Service - Zeabur 优化 Dockerfile
# 基于 Zeabur AI 诊断建议优化

FROM python:3.11-slim

LABEL "language"="python"
LABEL "framework"="fastapi"

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# 升级 pip
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# ==================== 关键优化：先复制依赖，再复制代码 ====================
COPY requirements.txt ./

# 安装 Python 依赖（使用 pip 缓存）
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt

# ==================== 最后复制代码 ====================
COPY . .

# 设置 Python 路径
ENV PYTHONPATH="/app:$PYTHONPATH"

# 暴露端口
EXPOSE 8001

# 启动服务
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
