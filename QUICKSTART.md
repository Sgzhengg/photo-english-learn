# 快速开始指南

本指南帮助您快速部署和运行 Photo English Learn 后端服务。

## 部署方式选择

### 方式 1: Zeabur 部署（推荐）

最简单的方式，一键部署到云端。

**优点**：
- 无需配置服务器
- 自动扩展
- 一键部署

**成本**: ~$10-20/月

### 方式 2: 本地开发

在本地机器上运行所有服务。

**优点**：
- 完全控制
- 适合开发调试

**要求**: Python 3.11+, PostgreSQL 16, Redis 7

## Zeabur 快速部署

### 第 1 步：准备账号和服务

1. 注册 [Zeabur](https://zeabur.com/) 账号
2. 注册 [OpenRouter](https://openrouter.ai/) 并获取 API Key

### 第 2 步：创建项目

1. 在 Zeabur 创建新项目
2. 添加 PostgreSQL 服务（预构建）
3. 添加 Redis 服务（预构建）

### 第 3 步：部署后端服务

项目根目录包含 5 个 Dockerfile，按 Zeabur 命名规范：

1. **Auth Service**
   - 在 Zeabur 选择 Git 部署
   - 选择 `auth-service.Dockerfile`
   - 设置环境变量（见下方）

2. **Vision Service**
   - 选择 `vision-service.Dockerfile`
   - 设置环境变量

3. **Word Service**
   - 选择 `word-service.Dockerfile`
   - 设置环境变量

4. **Practice Service**
   - 选择 `practice-service.Dockerfile`
   - 设置环境变量

5. **TTS Service**
   - 选择 `tts-service.Dockerfile`
   - 设置环境变量

### 第 4 步：配置环境变量

在每个服务的 Environment Variables 中添加：

```bash
# 必需
OPENROUTER_API_KEY=sk-or-v1-xxx
DATABASE_URL=postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}
REDIS_URL=redis://${REDIS_HOST}:${REDIS_PORT}

# 可选
JWT_SECRET=photo-english-secret-key-2024
VISION_MODEL=openai/gpt-4o
TEXT_MODEL=meta-llama/llama-3-70b-instruct
```

### 第 5 步：初始化数据库

在 Zeabur PostgreSQL 服务的 Console 中：

```sql
-- 复制 shared/database/schema.sql 的内容并执行
```

验证表创建：
```sql
\dt
-- 应该看到：users, scenes, detected_objects, words, user_words, scene_sentences, review_records, tags, practice_records
```

### 第 6 步：验证部署

测试每个服务：

```bash
# 获取 Zeabur 分配的域名，然后测试
curl https://your-auth-service.zeabur.app/
curl https://your-vision-service.zeabur.app/
curl https://your-word-service.zeabur.app/
curl https://your-practice-service.zeabur.app/
curl https://your-tts-service.zeabur.app/
```

每个应该返回类似：
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "message": "Auth Service is running",
    "service": "auth"
  }
}
```

## 本地开发快速开始

### 第 1 步：安装依赖

```bash
# Python 3.11+
python --version

# 安装共享依赖
pip install -r shared/requirements.txt

# 安装各服务依赖
for service in auth-service vision-service word-service practice-service tts-service; do
  pip install -r services/$service/requirements.txt
done
```

### 第 2 步：启动数据库

使用 Docker 启动 PostgreSQL 和 Redis：

```bash
docker run -d \
  --name photo-english-db \
  -e POSTGRES_USER=photoenglish \
  -e POSTGRES_PASSWORD=photoenglish123 \
  -e POSTGRES_DB=photo_english \
  -p 5432:5432 \
  postgres:16

docker run -d \
  --name photo-english-redis \
  -p 6379:6379 \
  redis:7
```

### 第 3 步：配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```bash
OPENROUTER_API_KEY=sk-or-v1-xxx
DATABASE_URL=postgresql+asyncpg://photoenglish:photoenglish123@localhost:5432/photo_english
REDIS_URL=redis://localhost:6379
JWT_SECRET=photo-english-secret-key-2024
VISION_MODEL=openai/gpt-4o
TEXT_MODEL=meta-llama/llama-3-70b-instruct
```

### 第 4 步：初始化数据库

```bash
psql postgresql://photoenglish:photoenglish123@localhost:5432/photo_english < shared/database/schema.sql
```

### 第 5 步：启动服务

在 5 个不同的终端中：

```bash
# Terminal 1: Auth Service
cd services/auth-service
python main.py

# Terminal 2: Vision Service
cd services/vision-service
python main.py

# Terminal 3: Word Service
cd services/word-service
python main.py

# Terminal 4: Practice Service
cd services/practice-service
python main.py

# Terminal 5: TTS Service
cd services/tts-service
python main.py
```

### 第 6 步：测试服务

```bash
# 测试认证服务
curl http://localhost:8001/

# 测试视觉服务
curl http://localhost:8003/

# 测试词汇服务
curl http://localhost:8004/

# 测试练习服务
curl http://localhost:8005/

# 测试语音服务
curl http://localhost:8006/
```

## 开发前端应用

这是一个纯后端项目，您可以自由开发前端应用来连接这些后端服务。

推荐的前端框架：
- React + TypeScript
- Vue 3 + TypeScript
- Next.js
- Nuxt.js

前端需要配置的环境变量：
```bash
VITE_AUTH_SERVICE_URL=http://localhost:8001  # 或您的 Zeabur 域名
VITE_VISION_SERVICE_URL=http://localhost:8003
VITE_WORD_SERVICE_URL=http://localhost:8004
VITE_PRACTICE_SERVICE_URL=http://localhost:8005
VITE_TTS_SERVICE_URL=http://localhost:8006
```

## 故障排查

### Zeabur 部署失败

1. **检查日志**: 在 Zeabur 控制台查看服务日志
2. **验证环境变量**: 确保所有必需的环境变量已设置
3. **检查数据库连接**: 确保 PostgreSQL 服务正在运行
4. **验证 API Key**: 确认 OPENROUTER_API_KEY 有效

### 本地开发问题

1. **端口冲突**: 确保端口 8001-8006 没有被占用
2. **数据库连接**: 检查 PostgreSQL 和 Redis 是否正在运行
3. **依赖安装**: 使用 `pip install -r requirements.txt` 安装所有依赖

### 服务启动失败

1. **Python 版本**: 确保使用 Python 3.11+
2. **环境变量**: 检查 `.env` 文件是否正确配置
3. **数据库初始化**: 确保数据库 schema 已执行

## 下一步

部署成功后：

1. 阅读 [ARCHITECTURE.md](ARCHITECTURE.md) 了解架构设计
2. 阅读 [OPENROUTER.md](OPENROUTER.md) 配置 AI 模型
3. 开发前端应用连接这些后端服务
4. 根据需要自定义和扩展功能

## 需要帮助？

- 查看 API 文档：`http://localhost:PORT/docs`
- 提交 GitHub Issue
- 查看 [README.md](README.md) 了解更多详情
