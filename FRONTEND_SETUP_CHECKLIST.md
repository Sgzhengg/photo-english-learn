# 前端开发准备清单

## 后端服务状态确认

### ✅ 已完成

- [x] 5 个微服务部署成功
- [x] PostgreSQL 数据库初始化完成
- [x] Redis 缓存服务运行正常
- [x] 所有依赖问题已解决

### 🎯 现在需要做的事

## 1. 后端服务验证与信息收集

### 1.1 获取所有服务的公开 URL

在 Zeabur 控制台记录每个服务的域名：

```bash
# 示例格式（请替换为您的实际域名）
Auth Service:     https://photo-english-auth.zeabur.app
Vision Service:   https://photo-english-vision.zeabur.app
Word Service:     https://photo-english-word.zeabur.app
Practice Service: https://photo-english-practice.zeabur.app
TTS Service:      https://photo-english-tts.zeabur.app
```

### 1.2 测试所有服务的 API 端点

```bash
# 健康检查
curl https://your-auth-service.zeabur.app/
curl https://your-vision-service.zeabur.app/
curl https://your-word-service.zeabur.app/
curl https://your-practice-service.zeabur.app/
curl https://your-tts-service.zeabur.app/

# 查看 API 文档
# 在浏览器中访问：
https://your-auth-service.zeabur.app/docs
https://your-vision-service.zeabur.app/docs
https://your-word-service.zeabur.app/docs
https://your-practice-service.zeabur.app/docs
https://your-tts-service.zeabur.app/docs
```

### 1.3 测试核心 API 功能

```bash
# 测试用户注册
curl -X POST https://your-auth-service.zeabur.app/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# 测试用户登录
curl -X POST https://your-auth-service.zeabur.app/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
# 保存返回的 access_token

# 测试获取当前用户信息
curl https://your-auth-service.zeabur.app/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 测试词汇查询
curl https://your-word-service.zeabur.app/lookup/apple

# 测试生词列表（需要 token）
curl https://your-word-service.zeabur.app/list \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 2. API 文档整理

### 2.1 创建 API 接口文档

创建 `frontend/API_REFERENCE.md` 文件，记录所有 API 端点：

```markdown
# API 接口文档

## 基础 URL

- Auth Service: https://your-auth-service.zeabur.app
- Vision Service: https://your-vision-service.zeabur.app
- Word Service: https://your-word-service.zeabur.app
- Practice Service: https://your-practice-service.zeabur.app
- TTS Service: https://your-tts-service.zeabur.app

## 认证流程

### 1. 用户注册
POST /register
{
  "username": "string",
  "email": "string",
  "password": "string"
}

### 2. 用户登录
POST /login
{
  "username": "string",
  "password": "string"
}

响应: { "access_token": "string", "token_type": "bearer" }

### 3. 获取当前用户
GET /me
Headers: Authorization: Bearer {token}
```

### 2.2 生成 OpenAPI/Swagger 文档

访问每个服务的 `/docs` 端点，导出 OpenAPI JSON 规范：

```bash
# 获取 OpenAPI 规范
curl https://your-auth-service.zeabur.app/openapi.json > auth-openapi.json
curl https://your-vision-service.zeabur.app/openapi.json > vision-openapi.json
curl https://your-word-service.zeabur.app/openapi.json > word-openapi.json
curl https://your-practice-service.zeabur.app/openapi.json > practice-openapi.json
curl https://your-tts-service.zeabur.app/openapi.json > tts-openapi.json
```

## 3. CORS 配置确认

### 3.1 检查后端 CORS 设置

确认所有服务允许前端域名访问：

```python
# 每个 services/*/main.py 中应该有
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应设置具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3.2 为 Netlify 配置 CORS

在部署到 Netlify 前，需要获取 Netlify 域名：

```python
# 示例：允许特定域名
allow_origins=[
    "https://your-frontend.netlify.app",
    "http://localhost:5173",  # 本地开发
    "http://localhost:3000",
]
```

## 4. 前端项目初始化

### 4.1 选择前端技术栈

推荐选项：

#### 选项 A: React + TypeScript (推荐用于 Netlify)
```bash
npx create-react-app frontend --template typescript
# 或
npx create-vite@latest frontend -- --template react-ts
```

#### 选项 B: Vue 3 + TypeScript
```bash
npm create vite@latest frontend -- --template vue-ts
```

#### 选项 C: Next.js (支持 SSR)
```bash
npx create-next-app@latest frontend --typescript
```

### 4.2 安装必要依赖

```bash
# HTTP 客户端
npm install axios

# 状态管理（可选）
npm install @reduxjs/toolkit react-redux
# 或
npm install pinia  # Vue 3

# UI 框架（推荐移动端优先）
# React:
npm install @mui/material @emotion/react @emotion/styled
# 或
npm install antd-mobile

# Vue:
npm install vant

# 路由
npm install react-router-dom  # React
# 或
npm install vue-router  # Vue

# 工具库
npm install dayjs  # 日期处理
npm install lodash-es  # 工具函数
```

### 4.3 配置环境变量

创建 `.env.development` 和 `.env.production`：

```bash
# .env.development
VITE_AUTH_SERVICE_URL=http://localhost:8001
VITE_VISION_SERVICE_URL=http://localhost:8003
VITE_WORD_SERVICE_URL=http://localhost:8004
VITE_PRACTICE_SERVICE_URL=http://localhost:8005
VITE_TTS_SERVICE_URL=http://localhost:8006

# .env.production (部署到 Netlify 后填写)
VITE_AUTH_SERVICE_URL=https://your-auth-service.zeabur.app
VITE_VISION_SERVICE_URL=https://your-vision-service.zeabur.app
VITE_WORD_SERVICE_URL=https://your-word-service.zeabur.app
VITE_PRACTICE_SERVICE_URL=https://your-practice-service.zeabur.app
VITE_TTS_SERVICE_URL=https://your-tts-service.zeabur.app
```

## 5. API 客户端封装

### 5.1 创建 HTTP 客户端

创建 `frontend/src/api/client.ts`：

```typescript
import axios from 'axios'

const BASE_URLS = {
  auth: import.meta.env.VITE_AUTH_SERVICE_URL,
  vision: import.meta.env.VITE_VISION_SERVICE_URL,
  word: import.meta.env.VITE_WORD_SERVICE_URL,
  practice: import.meta.env.VITE_PRACTICE_SERVICE_URL,
  tts: import.meta.env.VITE_TTS_SERVICE_URL,
}

// 创建 axios 实例
const createApiClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // 请求拦截器（添加 token）
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => Promise.reject(error)
  )

  // 响应拦截器（处理错误）
  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        // Token 过期，跳转登录
        localStorage.removeItem('access_token')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return client
}

export const api = {
  auth: createApiClient(BASE_URLS.auth),
  vision: createApiClient(BASE_URLS.vision),
  word: createApiClient(BASE_URLS.word),
  practice: createApiClient(BASE_URLS.practice),
  tts: createApiClient(BASE_URLS.tts),
}
```

### 5.2 创建 API 服务模块

创建 `frontend/src/api/services.ts`：

```typescript
import { api } from './client'

// 认证服务
export const authService = {
  register: (data: { username: string; email: string; password: string }) =>
    api.auth.post('/register', data),

  login: (data: { username: string; password: string }) =>
    api.auth.post('/login', data),

  getCurrentUser: () =>
    api.auth.get('/me'),
}

// 视觉服务
export const visionService = {
  analyzeImage: (imageUrl: string) =>
    api.vision.post('/analyze', { image_url: imageUrl }),

  generateScene: (imageUrl: string) =>
    api.vision.post('/scene', { image_url: imageUrl }),
}

// 词汇服务
export const wordService = {
  lookup: (word: string) =>
    api.word.get(`/lookup/${word}`),

  addWord: (data: { word_id: number; scene_id?: number }) =>
    api.word.post('/add', data),

  getWordList: (params?: { tag_id?: number; search?: string }) =>
    api.word.get('/list', { params }),

  searchWords: (query: string) =>
    api.word.get(`/search/${query}`),
}

// 练习服务
export const practiceService = {
  generateSentences: (sceneId: number) =>
    api.practice.post('/generate', { scene_id: sceneId }),

  getReviewList: () =>
    api.practice.get('/review'),
}

// TTS 服务
export const ttsService = {
  synthesize: (text: string, voice?: string) =>
    api.tts.post('/synthesize', { text, voice }),
}
```

## 6. 项目结构规划

### 6.1 推荐的前端目录结构

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/
│   │   ├── client.ts          # HTTP 客户端
│   │   ├── services.ts        # API 服务
│   │   └── types.ts          # TypeScript 类型
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── camera/
│   │   │   └── CameraCapture.tsx
│   │   ├── word/
│   │   │   ├── WordCard.tsx
│   │   │   └── WordList.tsx
│   │   └── practice/
│   │       ├── SentenceCard.tsx
│   │       └── ReviewList.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Camera.tsx
│   │   ├── WordList.tsx
│   │   └── Practice.tsx
│   ├── hooks/
│   │   ├── useAuth.ts          # 认证钩子
│   │   ├── useWords.ts        # 词汇钩子
│   │   └── useCamera.ts       # 相机钩子
│   ├── store/
│   │   ├── authSlice.ts       # 认证状态
│   │   └── wordSlice.ts       # 词汇状态
│   ├── types/
│   │   ├── user.ts
│   │   ├── word.ts
│   │   └── scene.ts
│   ├── utils/
│   │   ├── validation.ts      # 表单验证
│   │   └── format.ts          # 格式化工具
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.development
├── .env.production
├── package.json
├── tsconfig.json
├── vite.config.ts
└── netlify.toml
```

### 6.2 创建 Netlify 配置文件

创建 `frontend/netlify.toml`：

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

## 7. 数据类型定义

### 7.1 创建 TypeScript 类型

创建 `frontend/src/api/types.ts`：

```typescript
// 用户类型
export interface User {
  user_id: number
  username: string
  email: string
  nickname?: string
  avatar_url?: string
  created_at: string
}

// 认证响应
export interface AuthResponse {
  access_token: string
  token_type: string
}

// 单词类型
export interface Word {
  word_id: number
  english_word: string
  chinese_meaning: string
  phonetic_us?: string
  phonetic_uk?: string
  audio_url?: string
  example_sentence?: string
  example_translation?: string
  image_url?: string
}

// 用户生词
export interface UserWord {
  id: number
  user_id: number
  word_id: number
  scene_id?: number
  tag_id: number
  created_at: string
  word?: Word
  tag?: Tag
}

// 标签类型
export interface Tag {
  tag_id: number
  tag_name: string
  description?: string
  color: string
}

// 场景类型
export interface Scene {
  scene_id: number
  user_id: number
  image_url: string
  description?: string
  created_at: string
}

// 检测到的物体
export interface DetectedObject {
  object_id: number
  scene_id: number
  object_name: string
  english_word: string
  confidence: number
  bounding_box?: any
}

// API 响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}
```

## 8. 本地开发环境准备

### 8.1 配置代理（本地开发）

在 `vite.config.ts` 中配置代理：

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/auth': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, '')
      },
      '/api/vision': {
        target: 'http://localhost:8003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vision/, '')
      },
      '/api/word': {
        target: 'http://localhost:8004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/word/, '')
      },
      '/api/practice': {
        target: 'http://localhost:8005',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/practice/, '')
      },
      '/api/tts': {
        target: 'http://localhost:8006',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tts/, '')
      },
    }
  }
})
```

## 9. Netlify 部署准备

### 9.1 在 Netlify 创建站点

1. 登录 https://app.netlify.com/
2. 点击 "Add new site" → "Import an existing project"
3. 连接您的 Git 仓库
4. 配置构建设置：
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Branch to deploy**: `main`

### 9.2 配置环境变量

在 Netlify Site settings → Environment variables：

```bash
VITE_AUTH_SERVICE_URL=https://your-auth-service.zeabur.app
VITE_VISION_SERVICE_URL=https://your-vision-service.zeabur.app
VITE_WORD_SERVICE_URL=https://your-word-service.zeabur.app
VITE_PRACTICE_SERVICE_URL=https://your-practice-service.zeabur.app
VITE_TTS_SERVICE_URL=https://your-tts-service.zeabur.app
```

### 9.3 更新后端 CORS 配置

获取 Netlify 域名后，更新所有后端服务的 CORS 设置：

```python
# services/*/main.py
allow_origins=[
    "https://your-frontend.netlify.app",  # 替换为实际域名
    "http://localhost:5173",
    "http://localhost:3000",
]
```

## 10. 功能开发优先级

### Phase 1: 基础功能（MVP）
1. ✅ 用户注册/登录
2. ✅ 相机拍照/上传图片
3. ✅ 图片物体识别
4. ✅ 查看单词详情
5. ✅ 添加到生词本

### Phase 2: 核心学习功能
6. ✅ 生词本管理
7. ✅ 标签分类
8. ✅ 场景例句生成
9. ✅ 单词发音（TTS）
10. ✅ 复习系统

### Phase 3: 增强功能
11. ✅ 跟读练习
12. ✅ 学习统计
13. ✅ 搜索功能
14. ✅ 个人中心

## 11. 开发工具推荐

### 11.1 VSCode 插件
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar) - Vue 项目
- Auto Rename Tag
- Path Intellisense

### 11.2 浏览器插件
- React Developer Tools
- Vue.js devtools
- Axios 接口调试

## 12. 测试数据准备

### 12.1 创建测试账号

在 Zeabur PostgreSQL Console 中：

```sql
-- 创建测试用户
INSERT INTO users (username, email, password_hash, nickname) VALUES
('testuser1', 'test1@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEmc0i', '测试用户1'),
('testuser2', 'test2@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEmc0i', '测试用户2');
```

默认密码：`admin123`（如果使用相同的 hash）

### 12.2 准备测试图片

准备几张测试图片：
- 包含清晰物体的场景（如桌子上的杯子、书架上的书）
- 不同角度的照片
- 不同光线的照片

## 13. 性能优化准备

### 13.1 图片优化

考虑使用图片 CDN：
- Cloudinary
- Imgix
- 或直接使用 Zeabur 对象存储

### 13.2 缓存策略

```typescript
// 实现简单的内存缓存
const cache = new Map<string, any>()

export const useCachedData = <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60000 // 1 分钟
) => {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }

  return fetcher().then(data => {
    cache.set(key, { data, timestamp: Date.now() })
    return data
  })
}
```

## 14. 监控和日志

### 14.1 错误监控

可选集成 Sentry：
```bash
npm install @sentry/react
```

### 14.2 用户分析

可选集成 Google Analytics 或 Mixpanel

## 检查清单总结

### 后端准备 ✅
- [x] 所有 5 个服务运行正常
- [x] API 端点可访问
- [x] PostgreSQL 数据库已初始化
- [x] Redis 缓存服务运行正常

### 前端准备清单
- [ ] 获取所有服务的 Zeabur URL
- [ ] 测试所有 API 端点
- [ ] 记录 API 文档
- [ ] 配置 CORS（允许 Netlify 域名）
- [ ] 初始化前端项目
- [ ] 配置环境变量
- [ ] 创建 API 客户端封装
- [ ] 定义 TypeScript 类型
- [ ] 规划项目结构
- [ ] 设置 Netlify 部署
- [ ] 创建测试账号和数据

### 下一步行动

1. **立即执行**：获取所有 Zeabur 服务 URL
2. **今天完成**：测试所有 API，创建 API 文档
3. **本周完成**：初始化前端项目，配置环境
4. **下周开始**：开始 UI 开发

祝前端开发顺利！🚀
