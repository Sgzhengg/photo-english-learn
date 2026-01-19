FROM python:3.11-slim

WORKDIR /app

# 复制网关代码
COPY services/api-gateway/main.py .

# 安装依赖
COPY services/api-gateway/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 暴露端口
EXPOSE 8080

# 启动服务
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
