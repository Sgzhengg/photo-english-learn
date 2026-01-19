# Photo English Learn - Backend Services

一个基于 AI 的英语学习后端服务，通过拍照识别物体来学习英语词汇。

## 项目概述

这是一个微服务架构的后端项目，包含 5 个独立的服务：

- **Auth Service** - 用户认证和授权（端口 8001）
- **Vision Service** - 图像识别和物体检测（端口 8003）
- **Word Service** - 词汇管理和生词本（端口 8004）
- **Practice Service** - 练习和复习系统（端口 8005）
- **TTS Service** - 文字转语音服务（端口 8006）

## 技术栈

- **语言**: Python 3.11
- **框架**: FastAPI
- **数据库**: PostgreSQL 16
- **缓存**: Redis 7
- **AI**: OpenRouter API (GPT-4o, Claude 3.5, Llama 3)
- **部署**: Zeabur (Docker)

## 项目结构

```
photo-english-learn/
├── services/
│   ├── auth-service/          # 认证服务
│   ├── vision-service/        # 视觉识别服务
│   ├── word-service/          # 词汇管理服务
│   ├── practice-service/      # 练习服务
│   └── tts-service/           # 语音合成服务
├── shared/                    # 共享代码
│   ├── database/              # 数据库模型和连接
│   ├── utils/                 # 工具函数
│   ├── vision/                # 视觉识别模块
│   ├── word/                  # 词汇处理模块
│   └── tts/                   # 语音合成模块
├── auth-service.Dockerfile    # Auth Service 的 Zeabur Dockerfile
├── vision-service.Dockerfile  # Vision Service 的 Zeabur Dockerfile
├── word-service.Dockerfile    # Word Service 的 Zeabur Dockerfile
├── practice-service.Dockerfile # Practice Service 的 Zeabur Dockerfile
├── tts-service.Dockerfile     # TTS Service 的 Zeabur Dockerfile
├── .env.example               # 环境变量示例
├── ARCHITECTURE.md            # 架构设计文档
├── OPENROUTER.md              # OpenRouter API 配置说明
├── QUICKSTART.md              # 快速开始指南
└── README.md                  # 本文件
```

## 快速开始

### 前置要求

- Python 3.11+
- PostgreSQL 16
- Redis 7
- OpenRouter API Key

### 本地开发

1. **克隆仓库并安装依赖**

```bash
# 安装共享依赖
pip install -r shared/requirements.txt

# 安装各服务依赖
pip install -r services/auth-service/requirements.txt
pip install -r services/vision-service/requirements.txt
pip install -r services/word-service/requirements.txt
pip install -r services/practice-service/requirements.txt
pip install -r services/tts-service/requirements.txt
```

2. **配置环境变量**

```bash
cp .env.example .env
# 编辑 .env 文件，填写必要的配置
```

必需的环境变量：
```bash
OPENROUTER_API_KEY=sk-or-v1-xxx
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/photo_english
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

3. **初始化数据库**

```bash
# 使用 psql 执行数据库架构
psql $DATABASE_URL < shared/database/schema.sql
```

4. **启动服务**

```bash
# 启动认证服务
cd services/auth-service
python main.py

# 在其他终端启动其他服务
cd services/vision-service
python main.py

# ... 依此类推
```

## 服务说明

### Auth Service (认证服务)

- **端口**: 8001
- **功能**: 用户注册、登录、JWT 令牌管理
- **API 端点**:
  - `POST /register` - 用户注册
  - `POST /login` - 用户登录
  - `GET /me` - 获取当前用户信息

### Vision Service (视觉识别服务)

- **端口**: 8003
- **功能**: 图像识别、物体检测、场景理解
- **API 端点**:
  - `POST /analyze` - 分析图像并检测物体
  - `POST /scene` - 生成场景描述

### Word Service (词汇服务)

- **端口**: 8004
- **功能**: 词汇查询、生词本管理、标签系统
- **API 端点**:
  - `GET /list` - 获取生词列表
  - `POST /add` - 添加生词
  - `GET /lookup/{word}` - 查询单词
  - `GET /search/{query}` - 搜索单词

### Practice Service (练习服务)

- **端口**: 8005
- **功能**: 场景例句生成、复习系统
- **API 端点**:
  - `POST /generate` - 生成练习句子
  - `GET /review` - 获取复习列表

### TTS Service (语音合成服务)

- **端口**: 8006
- **功能**: 文字转语音
- **API 端点**:
  - `POST /synthesize` - 合成语音

## 部署到 Zeabur

详细的部署指南请参考 [QUICKSTART.md](QUICKSTART.md)。

快速部署步骤：

1. **在 Zeabur 创建项目并添加服务**
   - PostgreSQL (预构建服务)
   - Redis (预构建服务)

2. **部署 5 个后端服务**
   - 使用项目根目录的 Dockerfile：
     - `auth-service.Dockerfile`
     - `vision-service.Dockerfile`
     - `word-service.Dockerfile`
     - `practice-service.Dockerfile`
     - `tts-service.Dockerfile`

3. **配置环境变量**

每个服务都需要以下环境变量：
```bash
OPENROUTER_API_KEY=sk-or-v1-xxx
DATABASE_URL=postgresql+asyncpg://...
REDIS_URL=redis://...
JWT_SECRET=photo-english-secret-key-2024
VISION_MODEL=openai/gpt-4o
TEXT_MODEL=meta-llama/llama-3-70b-instruct
```

4. **初始化数据库**

在 Zeabur PostgreSQL 服务的 Console 中执行 `shared/database/schema.sql` 的内容。

## API 文档

启动服务后，访问以下地址查看 API 文档：

- Auth Service: `http://localhost:8001/docs`
- Vision Service: `http://localhost:8003/docs`
- Word Service: `http://localhost:8004/docs`
- Practice Service: `http://localhost:8005/docs`
- TTS Service: `http://localhost:8006/docs`

## 常见问题

### 1. 如何获取 OpenRouter API Key？

访问 [OpenRouter](https://openrouter.ai/) 注册并获取 API Key。支持多种免费和付费模型。

### 2. 数据库连接失败？

确保 PostgreSQL 正在运行，并且 DATABASE_URL 格式正确：
```
postgresql+asyncpg://user:password@host:port/database
```

### 3. Redis 连接失败？

确保 Redis 正在运行，并且 REDIS_URL 格式正确：
```
redis://host:port
```

## 成本估算

Zeabur 部署成本（按月）：
- PostgreSQL (免费层): $0
- Redis (免费层): $0
- 5 个后端服务 (512MB): ~$10-20
- **总计**: ~$10-20/月

## 🚀 系统升级路线图

### 当前状态（v1.0 - MVP）

**并发处理能力：**
- 数据库连接池：pool_size=10, max_overflow=20（最多30个并发连接）
- 异步处理：asyncpg + FastAPI
- 单个服务：约 100-300 并发请求/秒
- 5个服务总计：500-1500 并发请求/秒
- Zeabur 512MB：约 50-100 并发用户

**已实现功能：**
- ✅ 基础异步数据库连接池
- ✅ JWT 用户认证
- ✅ 5个微服务独立部署
- ✅ OpenRouter API 集成

**缺失功能：**
- ❌ Redis 未实际使用（已部署但未集成）
- ❌ 无请求限流（Rate Limiting）
- ❌ 无缓存机制（重复调用 OpenRouter API）
- ❌ 无数据库索引优化
- ❌ 无服务状态监控
- ❌ 无用户充值/付费系统

---

### 第一阶段优化（v1.5 - 建议在用户量增长后实施）

**目标：** 降低 API 调用成本，提升性能

**并发处理优化：**
1. 集成 Redis 缓存
   - 缓存单词查询结果（TTL: 24小时）
   - 缓存场景识别结果（TTL: 7天）
   - 减少重复 OpenRouter API 调用
   - 预计降低 60-80% API 成本

2. 添加请求限流（Rate Limiting）
   - 基于用户 ID 的限流
   - 每用户每分钟最多 N 次请求
   - 使用 Redis 实现分布式限流
   - 防止单个用户滥用

3. 数据库优化
   - 为高频查询字段添加索引
   - 优化慢查询
   - 添加数据库连接池监控

**监控优化：**
1. 基础日志记录
   - API 请求日志
   - 错误日志
   - 性能指标（响应时间）

2. 简单监控面板
   - 服务健康状态
   - 活跃用户数
   - API 调用统计

**预计成本：** $10-20/月（Zeabur）不变，OpenRouter API 成本降低 60-80%

---

### 第二阶段优化（v2.0 - 商业化准备）

**目标：** 完整的商业系统，可控成本

**并发处理优化：**
1. 高级缓存策略
   - 多级缓存（Redis + 内存）
   - 缓存预热
   - 缓存雪崩防护

2. 消息队列
   - Celery + Redis
   - 异步处理耗时任务（图片分析、场景生成）
   - 任务失败重试机制

3. 性能优化
   - CDN 加速（图片、音频）
   - 数据库读写分离
   - 水平扩展（负载均衡）

**监控优化：**
1. 完整监控系统
   - 集成 Sentry（错误监控）
   - 集成 UptimeRobot（服务可用性监控）
   - 自建监控面板（Grafana + Prometheus）

2. 告警系统
   - 服务异常告警（Email/Telegram）
   - 成本超支告警
   - 性能下降告警

**付费系统：**
1. 用户配额系统
   - 免费用户每日 N 次调用
   - VIP 用户无限制
   - 使用量统计和计费

2. 充值/订阅系统
   - 积分系统
   - VIP 会员订阅（月费/年费）
   - 第三方支付集成（微信/支付宝/PayPal）

3. 用户中心
   - 账户余额
   - 使用记录
   - 充值记录
   - 发票管理

**预计成本：** $20-50/月（Zeabur）+ OpenRouter API（可向用户收费）

---

### 优化优先级建议

**立即执行（如果有用户）：**
- ✅ Redis 缓存集成（减少 API 成本）
- ✅ 请求限流（防止滥用）
- ✅ 数据库索引优化

**用户量 > 100 时：**
- ✅ 消息队列（异步处理）
- ✅ Sentry 错误监控
- ✅ 用户配额系统

**用户量 > 1000 或准备商业化：**
- ✅ 完整付费系统
- ✅ CDN 加速
- ✅ 负载均衡
- ✅ 完整监控告警

**参考文档：**
- 详细的技术实现方案请联系开发团队
- 或者参考 [ARCHITECTURE.md](ARCHITECTURE.md) 了解系统架构

## 📚 相关文档

### 部署相关
- [QUICKSTART.md](QUICKSTART.md) - 快速部署和使用
- [ZEABUR.md](ZEABUR.md) - Zeabur 完整部署指南
- [ZEBUR_URLS.md](ZEBUR_URLS.md) - Zeabur 服务 URL 配置

### 开发相关
- [FRONTEND_SETUP_CHECKLIST.md](FRONTEND_SETUP_CHECKLIST.md) - 前端开发准备清单
- [FRONTEND_DEVELOPMENT_PROMPT.md](FRONTEND_DEVELOPMENT_PROMPT.md) - AI 前端开发提示词（用于 Gemini 3）
- [ARCHITECTURE.md](ARCHITECTURE.md) - 系统架构设计文档
- [OPENROUTER.md](OPENROUTER.md) - OpenRouter API 配置

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
