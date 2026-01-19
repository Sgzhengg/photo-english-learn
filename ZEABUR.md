# Zeabur 部署指南

本项目已适配 Zeabur 平台，支持 PostgreSQL 和 Redis 作为预构建服务。

## 架构说明

### Zeabur 上的服务划分

| 服务类型 | Zeabur 服务 | 说明 |
|---------|------------|------|
| **数据库** | PostgreSQL (预构建) | 主数据库 |
| **缓存** | Redis (预构建) | 缓存服务 |
| **后端服务** | Docker 服务 | 5 个微服务 |
| **前端** | 静态网站 | Vercel/Netlify |

### 关于 node:18-alpine

`node:18-alpine` 仅用于**本地开发**，启动 Vite 开发服务器。

在 Zeabur 上，前端应该**编译后部署为静态文件**，不需要这个容器。

## 部署步骤

### 1. 准备数据库 (在 Zeabur)

#### 创建 PostgreSQL
1. 在 Zeabur 项目中点击 **"New Service"**
2. 选择 **"PostgreSQL"** (预构建服务)
3. Zeabur 自动提供：
   - `POSTGRES_HOST`
   - `POSTGRES_PORT`
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DB`

#### 创建 Redis
1. 点击 **"New Service"**
2. 选择 **"Redis"** (预构建服务)
3. Zeabur 自动提供连接信息

### 2. 部署后端服务（使用 VSCode 插件）

#### 方法一：VSCode 插件一键部署（推荐）

项目根目录已包含 5 个符合 Zeabur 命名规范的 Dockerfile：
- `auth-service.Dockerfile`
- `vision-service.Dockerfile`
- `word-service.Dockerfile`
- `practice-service.Dockerfile`
- `tts-service.Dockerfile`

**部署步骤**：

1. **安装 Zeabur VSCode 插件**
2. **打开项目**：在 VSCode 中打开 `photo-english-learn` 项目
3. **一键部署**：
   - 点击左侧 Zeabur 图标
   - 选择要部署的服务（从 5 个 Dockerfile 中选择）
   - 插件会自动识别并部署每个服务
4. **配置环境变量**（部署后设置）：

每个服务都需要以下环境变量：

```bash
# 必需（在 Zeabur 控制台设置）
OPENROUTER_API_KEY=sk-or-v1-xxx

# 数据库连接（Zeabur 会自动注入 PostgreSQL 连接）
DATABASE_URL=postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}

# Redis 连接（Zeabur 会自动注入）
REDIS_URL=redis://${REDIS_HOST}:${REDIS_PORT}

# 可选（有默认值）
JWT_SECRET=photo-english-secret-key-2024
VISION_MODEL=openai/gpt-4o
TEXT_MODEL=meta-llama/llama-3-70b-instruct
```

**方法二：手动部署（通过 Zeabur 控制台）**

如果不用 VSCode 插件，可以在 Zeabur 控制台手动创建：

1. 点击 **"New Service"** → **"Git"** → 选择你的仓库
2. 对于每个服务，选择对应的 Dockerfile：
   - Auth Service: 选择根目录的 `auth-service.Dockerfile`
   - Vision Service: 选择根目录的 `vision-service.Dockerfile`
   - Word Service: 选择根目录的 `word-service.Dockerfile`
   - Practice Service: 选择根目录的 `practice-service.Dockerfile`
   - TTS Service: 选择根目录的 `tts-service.Dockerfile`
3. 设置环境变量（同上）

### 3. 初始化数据库

在部署后端服务之前，需要初始化数据库架构：

1. **连接到 Zeabur PostgreSQL**
   - 在 Zeabur 控制台找到你的 PostgreSQL 服务
   - 点击 "Connection" 获取连接信息

2. **执行数据库架构**
   ```bash
   # 方法一：使用 psql
   psql $DATABASE_URL < shared/database/schema.sql

   # 方法二：通过 Zeabur 控制台
   # 在 PostgreSQL 服务的 "Console" 标签页中
   # 复制粘贴 shared/database/schema.sql 的内容执行
   ```

3. **验证表创建**
   ```sql
   \dt  # 列出所有表
   # 应该看到：users, scenes, detected_objects, words, user_words, scene_sentences, review_records, tags, practice_records
   ```

### 4. 部署前端

#### 方法一：Vercel (推荐)
1. 在 Vercel 创建新项目
2. 连接 Git 仓库
3. 配置：
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
4. 部署

#### 方法二：Zeabur 静态网站
需要先构建前端：

```bash
cd client
npm install
npm run build
```

然后在 Zeabur 创建静态网站服务，指向 `client/dist` 目录。

### 4. 环境变量映射

Zeabur 会自动替换环境变量：

| 本地环境变量 | Zeabur 自动提供 |
|-------------|---------------|
| `DATABASE_URL` | 从 PostgreSQL 服务自动注入 |
| `REDIS_URL` | 从 Redis 服务自动注入 |

只需手动配置：
- `OPENROUTER_API_KEY`
- `JWT_SECRET` (可选，会自动生成)

## Zeabur 特定配置

### Dockerfile 结构

项目根目录包含 5 个 Dockerfile，命名格式为 `servicename.Dockerfile`：

```dockerfile
# auth-service.Dockerfile 示例
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制 requirements 并安装
COPY services/auth-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

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
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
```

**关键点**：
- Dockerfile 位于**项目根目录**
- 使用 Zeabur 命名规范：`servicename.Dockerfile`
- WORKDIR 设置为 `/app/servicename`
- PYTHONPATH 包含 `/app` 以支持 `import shared`

### 健康检查

Zeabur 会自动检测 HTTP 健康检查端点：
- `GET /` - 返回服务状态

## 域名配置

部署完成后，Zeabur 会为每个服务分配域名：
- `https://xxx-xxx.zeabur.app`

配置前端的环境变量指向后端服务域名。

## 成本估算

| 服务 | Zeabur 配置 | 预估月费用 |
|------|------------|-----------|
| PostgreSQL | 预构建 (免费层) | $0 |
| Redis | 预构建 (免费层) | $0 |
| 5 个后端服务 | Docker (512MB) | ~$10-20 |
| 前端 | Vercel (免费) | $0 |
| **总计** | | **~$10-20/月** |

## 故障排查

### 服务启动失败
1. 检查日志：Zeabur 控制台 → Logs
2. 确认环境变量正确
3. 验证数据库连接

### 数据库连接失败
- 确认 PostgreSQL 服务已启动
- 检查 DATABASE_URL 格式

### API 调用失败
- 验证 OPENROUTER_API_KEY 有效
- 检查服务间网络连通性
