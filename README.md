# Photo English Learn - Full Stack Application

一个基于 AI 的英语学习全栈应用，通过拍照识别物体来学习英语词汇。

**🎯 现在是前后端一体化项目，简化开发和部署流程！**

## 项目概述

这是一个**前后端一体化**的全栈项目，包含：

- **前端** - React + TypeScript + Vite + Tailwind CSS
- **后端** - Python FastAPI 微服务架构
- **数据库** - PostgreSQL 16
- **缓存** - Redis 7
- **AI** - OpenRouter API (GPT-4o, Claude 3.5, Llama 3)

## 🏗️ 技术栈

### 前端
- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS v4
- **路由**: React Router v6
- **状态管理**: React Hooks

### 后端
- **框架**: FastAPI
- **语言**: Python 3.11
- **架构**: 微服务
- **认证**: JWT + 匿名用户支持

## 📁 项目结构

```
photo-english-learn/                    # 主仓库（前后端一体化）
├── frontend/                           # 前端代码
│   ├── src/
│   │   ├── components/                 # React 组件
│   │   ├── lib/                        # 工具函数和 API
│   │   ├── pages/                      # 页面组件
│   │   └── sections/                   # 功能模块
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts                  # ✅ 支持独立开发（npm run dev）
│   └── tsconfig.json
│
├── services/                           # 后端微服务
│   ├── api-gateway/                    # API 网关（托管前端静态文件）
│   ├── auth-service/                   # 认证服务 (8001)
│   ├── vision-service/                 # AI 视觉识别 (8003)
│   ├── word-service/                   # 词汇管理 (8004)
│   ├── practice-service/               # 练习系统 (8005)
│   ├── tts-service/                    # 语音合成 (8006)
│   └── asr-service/                    # 语音识别 (8080)
│
├── shared/                             # 共享代码
│   ├── database/                       # 数据库模型
│   ├── utils/                          # 工具函数
│   ├── vision/                         # AI 视觉模块
│   └── word/                           # 词汇处理模块
│
├── zeabur.yaml                         # Zeabur 部署配置
├── build-frontend.sh                   # 前端构建脚本 (Linux/Mac)
├── build-frontend.bat                  # 前端构建脚本 (Windows)
└── README.md                           # 本文件
```

## 🚀 快速开始

### 前置要求

- **Node.js** 18+ 和 npm
- **Python** 3.11+
- **PostgreSQL** 16
- **Redis** 7
- **OpenRouter API Key**

### 本地开发

#### 1. 安装后端依赖

```bash
# 安装共享依赖
pip install -r shared/requirements.txt

# 安装各服务依赖（根据需要）
pip install -r services/api-gateway/requirements.txt
pip install -r services/word-service/requirements.txt
# ... 其他服务
```

#### 2. 安装前端依赖

```bash
cd frontend
npm install
```

#### 3. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件
```

必需的环境变量：
```bash
OPENROUTER_API_KEY=sk-or-v1-xxx
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/photo_english
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

#### 4. 初始化数据库

```bash
psql $DATABASE_URL < shared/database/schema.sql
```

#### 5. 启动服务

**方式 A：独立启动（推荐用于开发）**

```bash
# 终端 1: 启动 API Gateway（也会托管前端）
cd services/api-gateway
python main.py

# 终端 2: 启动前端开发服务器（支持热重载）
cd frontend
npm run dev  # 访问 http://localhost:3000
```

**方式 B：一体化启动（简单测试）**

```bash
# 构建 + 启动后端（前端静态文件由 API Gateway 托管）
./build-frontend.sh  # 或 Windows: build-frontend.bat
cd services/api-gateway
python main.py  # 访问 http://localhost:8000
```

## 🔧 开发工作流

### 前端开发

```bash
cd frontend
npm run dev       # 启动开发服务器（热重载）
npm run build     # 构建生产版本
npm run preview   # 预览构建结果
```

**API 代理配置**：
- 开发时：Vite proxy 自动代理 `/api/*` 到后端
- 生产时：同域名，直接请求

### 后端开发

```bash
# 启动各个微服务
cd services/api-gateway && python main.py    # 8000 (主入口)
cd services/auth-service && python main.py    # 8001
cd services/word-service && python main.py    # 8004
# ... 其他服务
```

## 📦 部署到 Zeabur

### 一键部署（推荐）

**项目现已配置为一体化部署！**

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Your message"
   git push
   ```

2. **在 Zeabur 创建新项目**
   - 选择 GitHub 仓库
   - Zeabur 会自动识别 `zeabur.yaml` 配置

3. **配置环境变量**
   ```bash
   OPENROUTER_API_KEY=sk-or-v1-xxx
   DATABASE_URL=postgresql+asyncpg://...
   REDIS_URL=redis://...
   SKIP_AUTH=true
   ```

4. **添加预构建服务**
   - PostgreSQL (免费层)
   - Redis (免费层)

5. **部署！**
   - Zeabur 会自动构建前端 + 部署所有后端服务
   - 完成后获得一个域名，访问即可使用

### 手动部署（可选）

详见 [ZEABUR.md](ZEABUR.md)

## 🌐 访问地址

### 本地开发

- **前端开发服务器**: http://localhost:3000
- **API Gateway（含前端）**: http://localhost:8000
- **API 文档**: http://localhost:8000/docs

### 生产环境（Zeabur）

- **应用域名**: https://your-app.zeabur.app
- **API 文档**: https://your-app.zeabur.app/docs

## 📚 核心功能

### 已实现 ✅

- ✅ 用户认证（JWT + 匿名用户）
- ✅ 拍照识别英语单词（AI 视觉）
- ✅ 生词本管理
- ✅ 单词发音（Web Speech API）
- ✅ 练习和复习系统（艾宾浩斯曲线）
- ✅ 学习进度追踪
- ✅ 标签系统

### 计划中 🚧

- 🚧 单词发音评测（ASR）
- 🚧 社区分享功能
- 🚧 VIP 会员系统
- 🚧 学习数据统计

## 🔒 架构特点

### 前后端一体化优势

1. **简化部署**：一个仓库，一次推送，自动部署所有服务
2. **版本同步**：前后端 API 变更容易同步
3. **故障排查**：所有日志在一个地方
4. **成本更低**：Zeabur 按项目计费

### 微服务架构

- **API Gateway**：统一入口，代理所有请求
- **服务隔离**：每个服务独立部署，互不影响
- **水平扩展**：可根据负载独立扩展某个服务

## 📖 相关文档

- [ARCHITECTURE.md](ARCHITECTURE.md) - 系统架构设计
- [ZEABUR.md](ZEABUR.md) - Zeabur 部署详细指南
- [QUICKSTART.md](QUICKSTART.md) - 快速开始指南

## 🆘 常见问题

### Q: 前端还能独立开发吗？

**A:** 可以！`npm run dev` 完全支持独立开发，热重载等功能不变。

### Q: 如何配置 API 地址？

**A:** 开发时通过 Vite proxy 自动配置，生产时使用相对路径（同域名）。

### Q: 如何调试前端？

**A:** 运行 `npm run dev`，在浏览器打开 DevTools 即可调试。

### Q: 数据库如何初始化？

**A:** 执行 `shared/database/schema.sql` 中的 SQL 语句。

## 💡 成本估算

Zeabur 部署成本（按月）：
- PostgreSQL (免费层): $0
- Redis (免费层): $0
- 后端服务 (7个 × 512MB): ~$15-25
- **总计**: ~$15-25/月

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**✨ 现在开始你的 AI 英语学习之旅吧！**
