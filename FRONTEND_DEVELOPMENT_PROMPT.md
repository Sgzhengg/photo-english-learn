# 前端开发提示词 - 用于 Google Gemini 3

> 📌 **使用说明**：将本文档的全部内容复制并发送给 Google Gemini 3，让它为您开发前端应用。

---

## 角色设定

你是一位经验丰富的前端开发工程师，专精于 React + TypeScript + Vite 技术栈。你需要为 "Photo English Learn" 项目开发一个现代化的前端应用。

---

## 项目背景

**Photo English Learn** 是一个基于 AI 的英语学习应用，通过拍照识别物体来学习英语词汇。

### 后端架构
- 5个独立的微服务（已部署在 Zeabur）
- FastAPI + PostgreSQL + Redis + OpenRouter API
- JWT 认证系统

### 核心功能
1. 用户注册/登录
2. 相机拍照/上传图片
3. AI 图像识别（检测物体并生成英语词汇）
4. 词汇查询和学习
5. 生词本管理
6. 场景例句生成
7. 单词发音（TTS）
8. 复习系统

---

## 技术栈要求

### 必须使用
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **路由**: React Router v6
- **HTTP 客户端**: Axios
- **UI 框架**: Material-UI (MUI) v5
- **状态管理**: React Context API 或 Zustand
- **表单**: React Hook Form + Zod 验证
- **样式**: MUI sx prop 或 Emotion

### 推荐使用
- **图标**: MUI Icons
- **日期处理**: dayjs
- **工具函数**: lodash-es
- **相机**: react-html5-camera-photo
- **图片上传**: react-dropzone

### 不使用
- ❌ Redux（太重）
- ❌ jQuery（过时）
- ❌ Bootstrap（与 MUI 冲突）

---

## 项目结构

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/
│   │   ├── client.ts          # Axios 客户端配置
│   │   ├── services.ts        # API 服务封装
│   │   └── types.ts           # TypeScript 类型定义
│   ├── components/
│   │   ├── common/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorAlert.tsx
│   │   │   └── ProtectedRoute.tsx
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
│   ├── contexts/
│   │   └── AuthContext.tsx    # 认证上下文
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Camera.tsx
│   │   ├── WordList.tsx
│   │   └── Practice.tsx
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

---

## 后端服务 URLs

### 开发环境（.env.development）
```bash
VITE_AUTH_SERVICE_URL=http://localhost:8001
VITE_VISION_SERVICE_URL=http://localhost:8003
VITE_WORD_SERVICE_URL=http://localhost:8004
VITE_PRACTICE_SERVICE_URL=http://localhost:8005
VITE_TTS_SERVICE_URL=http://localhost:8006
```

### 生产环境（.env.production）
```bash
VITE_AUTH_SERVICE_URL=https://photo-english-learn-auth-service.zeabur.app
VITE_VISION_SERVICE_URL=https://vision-service.zeabur.app
VITE_WORD_SERVICE_URL=https://word-service.zeabur.app
VITE_PRACTICE_SERVICE_URL=https://practice-service.zeabur.app
VITE_TTS_SERVICE_URL=https://tts-service.zeabur.app
```

---

## API 接口文档

### 1. Auth Service（认证服务）

#### 用户注册
```typescript
POST /register
Content-Type: application/json

Request:
{
  "username": "string",
  "email": "string",
  "password": "string",
  "nickname": "string" // 可选
}

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "access_token": "string",
    "user": {
      "user_id": number,
      "username": "string",
      "email": "string",
      "nickname": "string",
      "avatar_url": "string",
      "created_at": "string"
    }
  }
}
```

#### 用户登录
```typescript
POST /login
Content-Type: application/json

Request:
{
  "username": "string",
  "password": "string"
}

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "access_token": "string",
    "user": { ... }
  }
}
```

#### 获取当前用户
```typescript
GET /me
Headers: Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "user_id": number,
    "username": "string",
    "email": "string",
    "nickname": "string",
    "avatar_url": "string",
    "created_at": "string"
  }
}
```

---

### 2. Vision Service（视觉识别服务）

#### 分析图像
```typescript
POST /analyze
Headers: Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "image_url": "string"
}

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "scene_id": number,
    "image_url": "string",
    "description": "string",
    "detected_objects": [
      {
        "object_id": number,
        "object_name": "string",
        "english_word": "string",
        "confidence": number
      }
    ]
  }
}
```

#### 生成场景描述
```typescript
POST /scene
Headers: Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "image_url": "string"
}

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "scene_id": number,
    "image_url": "string",
    "description": "string"
  }
}
```

---

### 3. Word Service（词汇服务）

#### 查询单词
```typescript
GET /lookup/{word}
Headers: Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "word_id": number,
    "english_word": "string",
    "chinese_meaning": "string",
    "phonetic_us": "string",
    "phonetic_uk": "string",
    "audio_url": "string",
    "example_sentence": "string",
    "example_translation": "string",
    "image_url": "string"
  }
}
```

#### 添加生词
```typescript
POST /add
Headers: Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "word_id": number,
  "scene_id": number, // 可选
  "tag_id": number // 可选，默认1
}

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "id": number,
    "user_id": number,
    "word_id": number,
    "scene_id": number,
    "tag_id": number,
    "created_at": "string"
  }
}
```

#### 获取生词列表
```typescript
GET /list
Headers: Authorization: Bearer {token}

Query Parameters:
- tag_id?: number (按标签筛选)
- search?: string (搜索单词)

Response:
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": number,
      "word_id": number,
      "scene_id": number,
      "tag_id": number,
      "created_at": "string",
      "word": {
        "word_id": number,
        "english_word": "string",
        "chinese_meaning": "string",
        "phonetic_us": "string",
        "audio_url": "string"
      },
      "tag": {
        "tag_id": number,
        "tag_name": "string",
        "color": "string"
      }
    }
  ]
}
```

#### 搜索单词
```typescript
GET /search/{query}
Headers: Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "word_id": number,
      "english_word": "string",
      "chinese_meaning": "string",
      "phonetic_us": "string"
    }
  ]
}
```

---

### 4. Practice Service（练习服务）

#### 生成练习句子
```typescript
POST /generate
Headers: Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "scene_id": number
}

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "sentence_id": number,
    "scene_id": number,
    "english_sentence": "string",
    "chinese_translation": "string",
    "key_words": ["string"]
  }
}
```

#### 获取复习列表
```typescript
GET /review
Headers: Authorization: Bearer {token}

Response:
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "sentence_id": number,
      "scene_id": number,
      "english_sentence": "string",
      "chinese_translation": "string",
      "key_words": ["string"],
      "review_count": number,
      "last_reviewed": "string"
    }
  ]
}
```

---

### 5. TTS Service（语音合成服务）

#### 合成语音
```typescript
POST /synthesize
Headers: Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "text": "string",
  "voice": "string" // 可选，默认 "en-US"
}

Response:
{
  "code": 200,
  "message": "success",
  "data": {
    "audio_url": "string"
  }
}
```

---

## TypeScript 类型定义

```typescript
// src/types/user.ts
export interface User {
  user_id: number
  username: string
  email: string
  nickname?: string
  avatar_url?: string
  created_at: string
}

export interface AuthResponse {
  access_token: string
  user: User
}

// src/types/word.ts
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

export interface Tag {
  tag_id: number
  tag_name: string
  description?: string
  color: string
}

// src/types/scene.ts
export interface Scene {
  scene_id: number
  user_id: number
  image_url: string
  description?: string
  created_at: string
}

export interface DetectedObject {
  object_id: number
  scene_id: number
  object_name: string
  english_word: string
  confidence: number
}

export interface AnalyzedScene {
  scene_id: number
  image_url: string
  description?: string
  detected_objects: DetectedObject[]
}

// src/types/api.ts
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}
```

---

## 核心功能要求

### 1. 认证系统（必须）
- [ ] 用户注册页面（用户名、邮箱、密码）
- [ ] 用户登录页面
- [ ] JWT Token 管理（存储在 localStorage）
- [ ] Token 自动刷新
- [ ] 路由守卫（未登录自动跳转到登录页）
- [ ] 退出登录功能

### 2. 相机功能（必须）
- [ ] 调用设备相机拍照
- [ ] 支持上传本地图片
- [ ] 图片预览
- [ ] 图片压缩（上传前处理）
- [ ] 上传到图床（可以使用免费服务如 imgbb）

### 3. AI 识别功能（必须）
- [ ] 调用 Vision Service 分析图片
- [ ] 显示检测到的物体列表
- [ ] 显示每个物体的置信度
- [ ] 点击物体查看详情
- [ ] 生成场景描述

### 4. 词汇学习功能（必须）
- [ ] 显示单词详情（英文、中文、音标）
- [ ] 播放单词发音（调用 TTS Service）
- [ ] 显示例句和翻译
- [ ] 添加到生词本
- [ ] 生词本列表（按标签筛选）
- [ ] 搜索单词功能

### 5. 练习功能（必须）
- [ ] 生成场景例句
- [ ] 显示关键词
- [ ] 播放句子发音
- [ ] 复习列表
- [ ] 复习进度追踪

### 6. UI/UX 要求（必须）
- [ ] 移动端优先设计
- [ ] 响应式布局
- [ ] 加载状态提示
- [ ] 错误提示
- [ ] 成功提示
- [ ] 暗色模式（可选）

---

## Axios 客户端配置示例

```typescript
// src/api/client.ts
import axios, { AxiosError } from 'axios'

const BASE_URLS = {
  auth: import.meta.env.VITE_AUTH_SERVICE_URL,
  vision: import.meta.env.VITE_VISION_SERVICE_URL,
  word: import.meta.env.VITE_WORD_SERVICE_URL,
  practice: import.meta.env.VITE_PRACTICE_SERVICE_URL,
  tts: import.meta.env.VITE_TTS_SERVICE_URL,
}

const createApiClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // 请求拦截器
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

  // 响应拦截器
  client.interceptors.response.use(
    (response) => response.data,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
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

---

## API 服务封装示例

```typescript
// src/api/services.ts
import { api } from './client'
import type { User, AuthResponse, Word, UserWord, AnalyzedScene } from '../types'

export const authService = {
  register: (data: { username: string; email: string; password: string; nickname?: string }) =>
    api.auth.post<any, AuthResponse>('/register', data),

  login: (data: { username: string; password: string }) =>
    api.auth.post<any, AuthResponse>('/login', data),

  getCurrentUser: () =>
    api.auth.get<any, User>('/me'),
}

export const visionService = {
  analyzeImage: (imageUrl: string) =>
    api.vision.post<any, AnalyzedScene>('/analyze', { image_url: imageUrl }),

  generateScene: (imageUrl: string) =>
    api.vision.post<any, { scene_id: number; description: string }>('/scene', { image_url: imageUrl }),
}

export const wordService = {
  lookup: (word: string) =>
    api.word.get<any, Word>(`/lookup/${word}`),

  addWord: (data: { word_id: number; scene_id?: number; tag_id?: number }) =>
    api.word.post<any, UserWord>('/add', data),

  getWordList: (params?: { tag_id?: number; search?: string }) =>
    api.word.get<any, UserWord[]>('/list', { params }),

  searchWords: (query: string) =>
    api.word.get<any, Word[]>(`/search/${query}`),
}

export const practiceService = {
  generateSentences: (sceneId: number) =>
    api.practice.post<any, { sentence_id: number; english_sentence: string; chinese_translation: string }>('/generate', { scene_id: sceneId }),

  getReviewList: () =>
    api.practice.get<any, any[]>('/review'),
}

export const ttsService = {
  synthesize: (text: string, voice?: string) =>
    api.tts.post<any, { audio_url: string }>('/synthesize', { text, voice }),
}
```

---

## 认证上下文示例

```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import type { User } from '../types'
import { authService } from '../api/services'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const userData = await authService.getCurrentUser()
          setUser(userData)
        } catch (error) {
          localStorage.removeItem('access_token')
          setToken(null)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [token])

  const login = async (username: string, password: string) => {
    const response = await authService.login({ username, password })
    setToken(response.access_token)
    setUser(response.user)
    localStorage.setItem('access_token', response.access_token)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('access_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

---

## 路由守卫示例

```typescript
// src/components/common/ProtectedRoute.tsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
```

---

## Netlify 配置

```toml
# netlify.toml
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

---

## 开发步骤建议

### 第一阶段：项目初始化
1. 创建 Vite + React + TypeScript 项目
2. 安装所有依赖
3. 配置环境变量
4. 创建项目结构
5. 配置 Axios 客户端
6. 定义 TypeScript 类型

### 第二阶段：认证系统
1. 创建 AuthContext
2. 创建登录页面
3. 创建注册页面
4. 实现路由守卫
5. 实现退出登录

### 第三阶段：核心功能
1. 创建相机组件
2. 实现图片上传
3. 实现 AI 识别
4. 创建单词卡片
5. 创建生词本

### 第四阶段：练习功能
1. 创建句子卡片
2. 实现复习列表
3. 实现 TTS 播放

### 第五阶段：优化和部署
1. 响应式优化
2. 错误处理
3. 加载状态
4. 部署到 Netlify

---

## 注意事项

1. **错误处理**：所有 API 调用都要有错误处理
2. **加载状态**：显示加载动画，提升用户体验
3. **移动端优化**：确保在手机上使用流畅
4. **图片处理**：上传前压缩图片，减少带宽消耗
5. **Token 管理**：Token 过期后自动跳转登录
6. **CORS 问题**：后端已配置 CORS，不需要额外处理
7. **环境变量**：开发环境和生产环境使用不同的 API URL

---

## 测试账号

在开发过程中，可以创建测试账号：
- 用户名：testuser
- 邮箱：test@example.com
- 密码：password123

---

## Netlify 部署指南

### 部署前准备

#### 1. 创建 Netlify 账号
- 访问 https://app.netlify.com/
- 使用 GitHub/GitLab/Bitbucket 账号登录

#### 2. 准备 Git 仓库
- 将前端代码推送到 GitHub 仓库
- 确保 `netlify.toml` 文件在项目根目录

---

### Netlify 配置文件

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

# SPA 路由配置
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# 环境变量
[build.environment]
  NODE_VERSION = "18"

# Headers 配置（可选）
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
```

---

### 部署步骤

#### 方法 1：通过 Netlify UI 部署（推荐）

1. **在 Netlify 创建新站点**
   - 点击 "Add new site" → "Import an existing project"
   - 选择 "Deploy with GitHub"
   - 授权 Netlify 访问你的 GitHub 仓库

2. **配置构建设置**
   - 选择你的前端项目仓库
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Branch to deploy**: `main`

3. **配置环境变量**
   - 在 Site settings → Environment variables → Add a variable
   - 添加以下环境变量：

   ```bash
   VITE_AUTH_SERVICE_URL=https://photo-english-learn-auth-service.zeabur.app
   VITE_VISION_SERVICE_URL=https://vision-service.zeabur.app
   VITE_WORD_SERVICE_URL=https://word-service.zeabur.app
   VITE_PRACTICE_SERVICE_URL=https://practice-service.zeabur.app
   VITE_TTS_SERVICE_URL=https://tts-service.zeabur.app
   ```

4. **部署站点**
   - 点击 "Deploy site"
   - 等待构建完成（约 1-2 分钟）
   - 获得 Netlify 域名：`https://your-project-name.netlify.app`

---

#### 方法 2：通过 Netlify CLI 部署

```bash
# 1. 安装 Netlify CLI
npm install -g netlify-cli

# 2. 登录 Netlify
netlify login

# 3. 初始化项目
netlify init

# 4. 部署预览
netlify deploy

# 5. 正式部署
netlify deploy --prod
```

---

### 部署后配置

#### 1. 更新后端 CORS 配置

**重要**：部署到 Netlify 后，需要更新所有后端服务的 CORS 配置，添加 Netlify 域名。

在每个服务的 `main.py` 中更新 CORS 配置：

```python
# services/*/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-project-name.netlify.app",  # 替换为你的 Netlify 域名
        "http://localhost:5173",  # 本地开发
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

更新后需要重新部署后端服务到 Zeabur。

---

#### 2. 自定义域名（可选）

在 Netlify Site settings → Domain management：
- 可以添加自定义域名
- 配置 DNS 记录
- 启用 HTTPS 自动加密

---

#### 3. 性能优化（可选）

在 Netlify 中可以启用：
- **Asset optimization**: 压缩 CSS、JS
- **CDN**: 全球 CDN 加速
- **Redirects**: 自定义重定向规则

---

### 环境变量管理

#### 开发环境 vs 生产环境

**开发环境 (`.env.development`)**:
```bash
# 本地开发时使用
VITE_AUTH_SERVICE_URL=http://localhost:8001
VITE_VISION_SERVICE_URL=http://localhost:8003
VITE_WORD_SERVICE_URL=http://localhost:8004
VITE_PRACTICE_SERVICE_URL=http://localhost:8005
VITE_TTS_SERVICE_URL=http://localhost:8006
```

**生产环境 (`.env.production`)**:
```bash
# Netlify 部署时使用
VITE_AUTH_SERVICE_URL=https://photo-english-learn-auth-service.zeabur.app
VITE_VISION_SERVICE_URL=https://vision-service.zeabur.app
VITE_WORD_SERVICE_URL=https://word-service.zeabur.app
VITE_PRACTICE_SERVICE_URL=https://practice-service.zeabur.app
VITE_TTS_SERVICE_URL=https://tts-service.zeabur.app
```

**注意**：
- `.env.production` 文件不会被提交到 Git
- 生产环境变量需要在 Netlify 控制台中配置
- Vite 会自动根据 `NODE_ENV` 加载对应的环境文件

---

### 常见问题

#### Q1: API 请求失败（CORS 错误）

**原因**: 后端 CORS 配置中没有 Netlify 域名

**解决方案**:
1. 在 Zeabur 更新每个服务的 `main.py`
2. 添加 Netlify 域名到 `allow_origins`
3. 重新部署服务

---

#### Q2: 环境变量未生效

**原因**: 环境变量命名错误或未在 Netlify 中配置

**解决方案**:
1. 确保变量名以 `VITE_` 开头
2. 在 Netlify Site settings → Environment variables 中添加
3. 重新触发部署

---

#### Q3: 页面刷新后 404

**原因**: SPA 路由配置问题

**解决方案**:
确保 `netlify.toml` 中有重定向配置：
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

#### Q4: 构建失败

**原因**: Node 版本不匹配或依赖问题

**解决方案**:
1. 在 `netlify.toml` 中指定 Node 版本：
```toml
[build.environment]
  NODE_VERSION = "18"
```

2. 检查 `package.json` 中的依赖版本
3. 查看 Netlify 构建日志排查错误

---

### 部署检查清单

部署前确认：
- [ ] 所有环境变量已配置
- [ ] `.env.production` 文件已创建
- [ ] `netlify.toml` 配置正确
- [ ] 代码已推送到 GitHub
- [ ] 本地构建测试通过（`npm run build`）

部署后确认：
- [ ] 站点可以正常访问
- [ ] API 请求正常工作
- [ ] 登录功能正常
- [ ] 所有功能可以正常使用
- [ ] 后端 CORS 已更新
- [ ] 移动端显示正常

---

### 成本估算

**Netlify 免费套餐**：
- 每月 100GB 带宽
- 每月 300 分钟构建时间
- 无限站点和部署
- **完全免费**，适合个人项目和 MVP

**Netlify Pro ($19/月）**：
- 每月 400GB 带域
- 每月 1000 分钟构建时间
- 更多高级功能

**建议**：先使用免费套餐，流量增长后再升级。

---

### 监控和日志

Netlify 提供：
- **Deploy logs**: 查看构建日志
- **Functions logs**: 查看函数日志
- **Analytics**: 访问统计（需要升级）

---

## 交付要求

请按照以下顺序完成开发：

1. ✅ 项目初始化和依赖安装
2. ✅ 配置 Axios 和 TypeScript 类型
3. ✅ 实现认证系统（登录、注册、路由守卫）
4. ✅ 实现相机功能（拍照、上传）
5. ✅ 实现 AI 识别（调用 Vision API）
6. ✅ 实现词汇学习（查词、生词本）
7. ✅ 实现练习功能（例句、复习）
8. ✅ UI/UX 优化（加载、错误、响应式）
9. ✅ 配置 Netlify 部署
10. ✅ 部署到 Netlify 并测试
11. ✅ 更新后端 CORS 配置
12. ✅ 完整测试所有功能

---

## 参考资料

### 前端技术文档
- [React 文档](https://react.dev/)
- [Vite 文档](https://vitejs.dev/)
- [Material-UI 文档](https://mui.com/)
- [React Router 文档](https://reactrouter.com/)
- [Axios 文档](https://axios-http.com/)

### Netlify 部署文档
- [Netlify 官方文档](https://docs.netlify.com/)
- [Netlify 部署指南](https://docs.netlify.com/site-deploys/overview/)
- [Vite + Netlify 部署](https://vitejs.dev/guide/static-deploy.html#netlify)
- [Netlify 环境变量](https://docs.netlify.com/site-deploys/environment-variables/)

---

## 开始开发

请按照以上要求，开始为 "Photo English Learn" 开发前端应用。逐步完成每个功能模块，确保代码质量和用户体验。

**重要提醒**：
- 优先实现核心功能（认证、相机、识别、词汇）
- 保持代码简洁和可维护性
- 添加必要的注释
- 遵循 React 最佳实践

祝开发顺利！🚀
