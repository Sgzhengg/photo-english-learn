# 前端应用重新设计提示词

> 📌 **使用说明**：这是一份完整的前端应用重新设计提示词，包含了问题分析、改造方案和实施步骤。
>
> **目标**：将现有的赛博朋克风格应用改造成 Material Design 3 风格的现代教育应用，并修复所有核心功能问题。

---

## 第一部分：当前代码存在的严重问题

### 🔴 问题 1：完全没有连接后端 API（最严重）

**问题描述**：
当前代码直接在前端调用 Google Gemini API，完全绕过了已经部署在 Zeabur 上的 5 个后端微服务。

**错误的实现**：
```typescript
// services/gemini.ts - ❌ 这是错误的！
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
export const recognizeImage = async (base64Image: string) => {
  // 直接调用 Gemini，而不是后端 Vision Service
}
```

**问题影响**：
- ❌ 无法使用用户认证系统
- ❌ 无法保存生词到数据库
- ❌ 生词数据只存在 localStorage，刷新就丢失
- ❌ 无法使用后端的练习系统
- ❌ 无法使用 TTS 语音合成服务
- ❌ 多设备无法同步
- ❌ API Key 暴露在前端，成本无法控制

**必须改为**：
```typescript
// ✅ 正确的实现
const VITE_VISION_SERVICE_URL = import.meta.env.VITE_VISION_SERVICE_URL;

export const recognizeImage = async (imageUrl: string, token: string) => {
  const response = await fetch(`${VITE_VISION_SERVICE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image_url: imageUrl })
  });
  return response.json();
}
```

---

### 🔴 问题 2：缺少完整的用户认证系统

**问题描述**：
登录和注册页面只有 UI 外壳，没有实际功能。用户无法真正登录，Token 无法管理，路由没有守卫。

**缺少的功能**：
1. 没有 JWT Token 存储和管理
2. 没有 AuthContext 状态管理
3. 没有路由守卫（未登录也能访问任何页面）
4. 没有 Axios 请求拦截器（自动添加 Token）
5. 没有登录状态持久化
6. 没有 Token 过期处理

**需要实现的完整认证流程**：
```typescript
// 1. AuthContext - 认证状态管理
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

// 2. ProtectedRoute - 路由守卫
<Route path="/home" element={
  <ProtectedRoute>
    <Home />
  </ProtectedRoute>
} />

// 3. Axios 拦截器 - 自动添加 Token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

### 🔴 问题 3：路由系统完全错误

**问题描述**：
使用 useState 管理页面路由，而不是真正的 URL 路由。

**错误的实现**：
```typescript
// ❌ 这是错误的！
const [view, setView] = useState<AppView>('login');
const renderView = () => {
  switch (view) {
    case 'login': return <Login />;
    case 'home': return <Home />;
    // ...
  }
};
```

**问题**：
- 无法使用浏览器前进/后退按钮
- 无法分享链接
- 刷新页面状态丢失
- 无法使用浏览器历史记录
- 不符合 SPA 应用标准

**必须改为**：
```typescript
// ✅ 正确的实现 - 使用 React Router v6
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/" element={
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    } />
    <Route path="/camera" element={
      <ProtectedRoute>
        <Camera />
      </ProtectedRoute>
    } />
    {/* ... 其他路由 */}
  </Routes>
</BrowserRouter>
```

---

### 🔴 问题 4：图片上传到后端的流程缺失

**问题描述**：
当前代码将图片转为 base64，但没有上传到图床获取 URL，导致无法传递给后端 API。

**错误的流程**：
```
拍照 → base64 → 直接调用 Gemini API ❌
```

**正确的流程**：
```
拍照 → 上传图床 → 获取 URL → 调用后端 API ✅
```

**需要实现**：
```typescript
// 1. 上传图片到图床（使用 imgbb 免费服务）
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    { method: 'POST', body: formData }
  );

  const data = await response.json();
  return data.data.url; // 返回图片 URL
};

// 2. 调用后端 API
export const analyzeImage = async (imageUrl: string, token: string) => {
  const response = await fetch(`${VITE_VISION_SERVICE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image_url: imageUrl })
  });
  return response.json();
};
```

---

### 🔴 问题 5：UI 设计不适合教育应用

**问题描述**：
当前采用赛博朋克/霓虹灯风格，虽然视觉冲击力强，但存在严重问题：

**具体问题**：
1. **过于花哨，分散学习注意力** - 教育应用应该简洁专注
2. **暗色主题为主** - 长时间使用眼睛疲劳
3. **霓虹灯效果** - 降低文字可读性
4. **动画过多** - 影响性能和专注度
5. **对比度不足** - 部分文字难以辨认

**用户反馈预期**：
- "界面太炫了，但看久了眼睛累"
- "找不到重点，不知道该点哪里"
- "想专心学单词，但背景太花哨"
- "在室外使用时，暗色主题看不清"

**必须改为 Material Design 3 风格**：
- 简洁清晰，专注内容
- 浅色主题为主，暗色模式可选
- 符合无障碍设计标准
- 适合长时间使用

---

### 🔴 问题 6：缺少完整的 npm 依赖包

**问题描述**：
package.json 中只有 React 和 @google/genai，缺少开发完整应用所需的依赖。

**当前缺少的依赖**：
```json
{
  "dependencies": {
    "react-router-dom": "^6.22.0",      // ❌ 缺少：路由
    "axios": "^1.6.7",                   // ❌ 缺少：HTTP 客户端
    "@mui/material": "^5.15.11",        // ❌ 缺少：UI 组件库
    "@mui/icons-material": "^5.15.11",  // ❌ 缺少：图标库
    "@emotion/react": "^11.11.4",       // ❌ 缺少：MUI 样式引擎
    "@emotion/styled": "^11.11.0",      // ❌ 缺少：MUI 样式
    "react-hook-form": "^7.51.0",       // ❌ 缺少：表单管理
    "zod": "^3.22.4",                   // ❌ 缺少：表单验证
    "dayjs": "^1.11.10"                 // ❌ 缺少：日期处理
  }
}
```

---

### 🔴 问题 7：环境变量配置错误

**问题描述**：
只有 `GEMINI_API_KEY=PLACEHOLDER_API_KEY`，缺少所有后端服务的 URLs。

**正确的配置**：
```bash
# .env.development - 开发环境
VITE_AUTH_SERVICE_URL=http://localhost:8001
VITE_VISION_SERVICE_URL=http://localhost:8003
VITE_WORD_SERVICE_URL=http://localhost:8004
VITE_PRACTICE_SERVICE_URL=http://localhost:8005
VITE_TTS_SERVICE_URL=http://localhost:8006

# .env.production - 生产环境
VITE_AUTH_SERVICE_URL=https://photo-english-learn-auth-service.zeabur.app
VITE_VISION_SERVICE_URL=https://vision-service.zeabur.app
VITE_WORD_SERVICE_URL=https://word-service.zeabur.app
VITE_PRACTICE_SERVICE_URL=https://practice-service.zeabur.app
VITE_TTS_SERVICE_URL=https://tts-service.zeabur.app

# 图床上传
IMGBB_API_KEY=your_imgbb_api_key
```

---

### 🔴 问题 8：TypeScript 类型定义不完整

**问题描述**：
types.ts 定义过于简单，缺少后端 API 响应类型和用户相关类型。

**需要添加的类型定义**：
```typescript
// types/user.ts
export interface User {
  user_id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar_url?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

// types/api.ts
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// types/word.ts
export interface Word {
  word_id: number;
  english_word: string;
  chinese_meaning: string;
  phonetic_us?: string;
  audio_url?: string;
}

// types/scene.ts
export interface DetectedObject {
  object_id: number;
  object_name: string;
  english_word: string;
  confidence: number;
}
```

---

## 第二部分：完整改造方案

### 🎨 UI 设计改造：从赛博朋克到 Material Design 3

#### 改造目标

将当前的花哨赛博朋克风格改为简洁、专业、适合学习的 Material Design 3 风格。

#### Material Design 3 核心原则

1. **简洁清晰** - 去除不必要的装饰
2. **内容优先** - 突出学习内容，而非界面
3. **颜色规范** - 使用经过验证的配色方案
4. **无障碍** - 符合 WCAG 标准
5. **响应式** - 完美适配各种设备

#### 配色方案对比

**当前配色（赛博朋克）**：
```css
--primary-neon: #00f2ff;      /* 霓虹蓝 - 刺眼 */
--cyber-pink: #FF00E5;         /* 霓虹粉 - 过于鲜艳 */
--cyber-purple: #7000FF;       /* 霓虹紫 - 对比度低 */
--midnight: #0A0E17;           /* 深黑背景 - 难以阅读 */
```

**新配色（Material Design 3）**：
```css
/* 主色调 - 蓝色系（专业、可信）*/
--md-sys-color-primary: #1976d2;
--md-sys-color-on-primary: #ffffff;
--md-sys-color-primary-container: #d3e3fd;
--md-sys-color-on-primary-container: #001d36;

/* 辅助色 - 紫色系（创意、友好）*/
--md-sys-color-secondary: #9c27b0;
--md-sys-color-on-secondary: #ffffff;
--md-sys-color-secondary-container: #f3e5f5;
--md-sys-color-on-secondary-container: #280036;

/* 背景色 - 浅色系（舒适、易读）*/
--md-sys-color-background: #fefbff;
--md-sys-color-on-background: #1b1b1f;
--md-sys-color-surface: #fefbff;
--md-sys-color-on-surface: #1b1b1f;

/* 语义色*/
--md-sys-color-error: #ba1a1a;
--md-sys-color-success: #2e7d32;
--md-sys-color-warning: #f57c00;
```

#### 字体系统

**当前字体**：
- Plus Jakarta Sans（英文）
- Noto Sans SC（中文）
- Space Grotesk（标题）

**新字体（Material Design 3 标准）**：
```css
/* 字体家族 */
--md-sys-typescale-font: 'Roboto', 'Noto Sans SC', sans-serif;

/* 字号规范 */
--md-sys-typescale-display-large: 57px / 64px;
--md-sys-typescale-headline-large: 32px / 40px;
--md-sys-typescale-title-large: 22px / 28px;
--md-sys-typescale-body-large: 16px / 24px;
--md-sys-typescale-body-medium: 14px / 20px;
--md-sys-typescale-label-large: 14px / 20px;
```

#### 组件规范

**卡片（Card）**：
```css
/* Material Design 3 卡片样式 */
.md-card {
  background: var(--md-sys-color-surface);
  border-radius: 12px;
  elevation: 1; /* 轻微阴影 */
  padding: 16px;
}

.md-card-elevated {
  elevation: 2; /* 更明显的阴影 */
}

.md-card-outlined {
  border: 1px solid var(--md-sys-color-outline);
  elevation: 0;
}
```

**按钮（Button）**：
```css
/* Filled Button - 主要操作 */
.md-button-filled {
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  border-radius: 20px;
  padding: 10px 24px;
  font-weight: 500;
}

/* Outlined Button - 次要操作 */
.md-button-outlined {
  background: transparent;
  color: var(--md-sys-color-primary);
  border: 1px solid var(--md-sys-color-outline);
  border-radius: 20px;
  padding: 10px 24px;
}

/* Text Button - 不强调的操作 */
.md-button-text {
  background: transparent;
  color: var(--md-sys-color-primary);
  border-radius: 20px;
  padding: 10px 24px;
}
```

**输入框（TextField）**：
```css
.md-text-field {
  background: var(--md-sys-color-surface-variant);
  border-radius: 4px;
  border-bottom: 1px solid var(--md-sys-color-on-surface-variant);
  padding: 16px;
  font-size: 16px;
}

.md-text-field:focus {
  border-bottom: 2px solid var(--md-sys-color-primary);
}
```

---

### 🏗️ 功能架构改造

#### 1. 完整的项目结构

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/
│   │   ├── client.ts              # Axios 客户端配置
│   │   ├── services.ts            # API 服务封装
│   │   └── image-upload.ts        # 图片上传服务
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
│   │   ├── AuthContext.tsx        # 认证上下文
│   │   └── ThemeContext.tsx       # 主题上下文
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Camera.tsx
│   │   ├── Result.tsx
│   │   ├── WordList.tsx
│   │   ├── Practice.tsx
│   │   └── Profile.tsx
│   ├── types/
│   │   ├── user.ts
│   │   ├── word.ts
│   │   ├── scene.ts
│   │   └── api.ts
│   ├── theme/
│   │   ├── index.ts               # Material-UI 主题配置
│   │   └── colors.ts              # 颜色定义
│   ├── utils/
│   │   ├── validation.ts
│   │   └── format.ts
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

#### 2. 核心 API 客户端配置

```typescript
// src/api/client.ts
import axios from 'axios';

// 从环境变量读取服务 URLs
const BASE_URLS = {
  auth: import.meta.env.VITE_AUTH_SERVICE_URL,
  vision: import.meta.env.VITE_VISION_SERVICE_URL,
  word: import.meta.env.VITE_WORD_SERVICE_URL,
  practice: import.meta.env.VITE_PRACTICE_SERVICE_URL,
  tts: import.meta.env.VITE_TTS_SERVICE_URL,
};

// 创建 Axios 客户端
const createApiClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器 - 自动添加 Token
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 响应拦截器 - 处理错误
  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        // Token 过期，清除并跳转登录
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

// 导出所有 API 客户端
export const api = {
  auth: createApiClient(BASE_URLS.auth),
  vision: createApiClient(BASE_URLS.vision),
  word: createApiClient(BASE_URLS.word),
  practice: createApiClient(BASE_URLS.practice),
  tts: createApiClient(BASE_URLS.tts),
};
```

#### 3. API 服务封装

```typescript
// src/api/services.ts
import { api } from './client';
import type { User, AuthResponse, Word, UserWord, AnalyzedScene } from '../types';

// 认证服务
export const authService = {
  register: (data: { username: string; email: string; password: string; nickname?: string }) =>
    api.auth.post<any, AuthResponse>('/register', data),

  login: (data: { username: string; password: string }) =>
    api.auth.post<any, AuthResponse>('/login', data),

  getCurrentUser: () =>
    api.auth.get<any, User>('/me'),
};

// 视觉识别服务
export const visionService = {
  analyzeImage: (imageUrl: string) =>
    api.vision.post<any, AnalyzedScene>('/analyze', { image_url: imageUrl }),

  generateScene: (imageUrl: string) =>
    api.vision.post<any, { scene_id: number; description: string }>('/scene', { image_url: imageUrl }),
};

// 词汇服务
export const wordService = {
  lookup: (word: string) =>
    api.word.get<any, Word>(`/lookup/${word}`),

  addWord: (data: { word_id: number; scene_id?: number; tag_id?: number }) =>
    api.word.post<any, UserWord>('/add', data),

  getWordList: (params?: { tag_id?: number; search?: string }) =>
    api.word.get<any, UserWord[]>('/list', { params }),

  searchWords: (query: string) =>
    api.word.get<any, Word[]>(`/search/${query}`),

  deleteWord: (id: number) =>
    api.word.delete(`/words/${id}`),
};

// 练习服务
export const practiceService = {
  generateSentences: (sceneId: number) =>
    api.practice.post<any, { sentence_id: number; english_sentence: string; chinese_translation: string }>('/generate', { scene_id }),

  getReviewList: () =>
    api.practice.get<any, any[]>('/review'),
};

// TTS 服务
export const ttsService = {
  synthesize: (text: string, voice?: string) =>
    api.tts.post<any, { audio_url: string }>('/synthesize', { text, voice }),
};
```

#### 4. 认证上下文实现

```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authService } from '../api/services';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('access_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (username: string, password: string) => {
    const response = await authService.login({ username, password });
    setToken(response.access_token);
    setUser(response.user);
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

#### 5. 路由守卫实现

```typescript
// src/components/common/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

#### 6. Material-UI 主题配置

```typescript
// src/theme/index.ts
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
      contrastText: '#fff',
    },
    background: {
      default: '#fefbff',
      paper: '#ffffff',
    },
    error: {
      main: '#ba1a1a',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#f57c00',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Noto Sans SC", sans-serif',
    h1: {
      fontSize: '2.125rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none', // Material Design 3 不强制大写
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12, // Material Design 3 圆角
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: 'none',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    // ... 暗色主题配置
  },
});
```

---

## 第三部分：具体页面改造方案

### 📱 登录页面改造

**改造前（赛博朋克风格）**：
```tsx
// ❌ 问题：花哨、难以阅读
<div className="glass-card neon-glow">
  <h1 className="text-primary-neon">登录</h1>
  <input className="cyber-input" />
</div>
```

**改造后（Material Design 3）**：
```tsx
// ✅ 简洁、清晰、专业
import { Box, Container, TextField, Button, Typography, Paper } from '@mui/material';

const LoginPage = () => {
  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight={600}>
          欢迎回来
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          登录拍照学英语，继续你的学习之旅
        </Typography>

        <TextField
          fullWidth
          label="用户名"
          margin="normal"
          variant="outlined"
          autoComplete="username"
        />
        <TextField
          fullWidth
          label="密码"
          type="password"
          margin="normal"
          variant="outlined"
          autoComplete="current-password"
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3, mb: 2 }}
        >
          登录
        </Button>

        <Typography align="center" variant="body2">
          还没有账号？{' '}
          <Link to="/register" style={{ color: '#1976d2' }}>
            立即注册
          </Link>
        </Typography>
      </Paper>
    </Container>
  );
};
```

---

### 📱 首页改造

**改造前**：
- 霓虹灯效果
- 过多装饰
- 信息不清晰

**改造后（Material Design 3）**：
```tsx
import { Box, Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';

const HomePage = () => {
  return (
    <Container maxWidth="sm" sx={{ pb: 10 }}>
      {/* 顶部欢迎区 */}
      <Box sx={{ pt: 4, pb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          你好，{user?.nickname || user?.username} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          今天想学什么新单词呢？
        </Typography>
      </Box>

      {/* 主要功能卡片 */}
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          cursor: 'pointer',
          '&:hover': { elevation: 4 },
        }}
        onClick={() => navigate('/camera')}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CameraIcon sx={{ fontSize: 48, mr: 2 }} />
            <Box>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                拍照识别
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                拍摄物体，AI 帮你学习英语单词
              </Typography>
            </Box>
          </Box>
          <Button variant="contained" color="inherit" fullWidth>
            开始拍照
          </Button>
        </CardContent>
      </Card>

      {/* 功能卡片网格 */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/words')}>
            <CardContent>
              <BookIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                生词本
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {vocabCount} 个单词
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/practice')}>
            <CardContent>
              <PsychologyIcon color="secondary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                练习
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {reviewCount} 个待复习
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};
```

---

### 📱 相机页面改造

**改造后**：
```tsx
import { Box, Button, Fab, Paper, Typography } from '@mui/material';
import { CameraAlt, PhotoLibrary } from '@mui/icons-material';

const CameraPage = () => {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部栏 */}
      <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Button onClick={() => navigate(-1)}>返回</Button>
        <Typography variant="h6" sx={{ ml: 2, flex: 1, textAlign: 'center' }}>
          拍照学英语
        </Typography>
        <Box sx={{ width: 64 }} /> {/* 占位，保持标题居中 */}
      </Paper>

      {/* 相机预览区 */}
      <Box sx={{ flex: 1, position: 'relative', bgcolor: 'black' }}>
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <video ref={videoRef} autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </Box>

      {/* 底部操作区 */}
      <Paper elevation={3} sx={{ p: 3 }}>
        {!previewUrl ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, alignItems: 'center' }}>
            <Fab color="default" onClick={handleSelectFromGallery}>
              <PhotoLibrary />
            </Fab>
            <Fab
              color="primary"
              sx={{ width: 72, height: 72 }}
              onClick={handleCapture}
            >
              <CameraAlt sx={{ fontSize: 32 }} />
            </Fab>
            <Box sx={{ width: 48 }} /> {/* 占位 */}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" fullWidth onClick={handleRetake}>
              重新拍摄
            </Button>
            <Button variant="contained" fullWidth onClick={handleAnalyze}>
              开始识别
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
```

---

### 📱 识别结果页面改造

**改造后**：
```tsx
import { Box, Container, Card, CardContent, Chip, IconButton, Button, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { VolumeUp, BookmarkBorder } from '@mui/icons-material';

const ResultPage = () => {
  return (
    <Container maxWidth="sm" sx={{ pb: 4 }}>
      {/* 图片预览 */}
      <Card sx={{ mb: 3 }}>
        <img src={result.imageUrl} alt="Scene" style={{ width: '100%', height: 'auto' }} />
      </Card>

      {/* 场景描述 */}
      {result.description && (
        <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              场景描述
            </Typography>
            <Typography variant="body1" gutterBottom>
              {result.description}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* 检测到的物体 */}
      <Typography variant="h6" fontWeight={600} gutterBottom>
        识别到的单词 ({result.objects.length})
      </Typography>

      <List>
        {result.objects.map((obj) => (
          <Card key={obj.id} sx={{ mb: 2 }}>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {obj.english_word[0].toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" fontWeight={600}>
                      {obj.english_word}
                    </Typography>
                    <IconButton size="small" onClick={() => playAudio(obj.english_word)}>
                      <VolumeUp fontSize="small" />
                    </IconButton>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {obj.chineseName}
                    </Typography>
                    <Chip
                      label={`置信度 ${obj.confidence}%`}
                      size="small"
                      color={obj.confidence > 80 ? 'success' : obj.confidence > 60 ? 'warning' : 'default'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                }
              />
              <IconButton onClick={() => addToVocab(obj)}>
                <BookmarkBorder />
              </IconButton>
            </ListItem>
          </Card>
        ))}
      </List>

      {/* 底部操作 */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button variant="outlined" fullWidth onClick={() => navigate('/camera')}>
          继续拍照
        </Button>
        <Button variant="contained" fullWidth onClick={addAllToVocab}>
          全部加入生词本
        </Button>
      </Box>
    </Container>
  );
};
```

---

### 📱 生词本页面改造

**改造后**：
```tsx
import { Box, Container, TextField, InputAdornment, Card, CardContent, Typography, Chip, IconButton, List, ListItem } from '@mui/material';
import { Search, VolumeUp, Delete } from '@mui/icons-material';

const WordListPage = () => {
  return (
    <Container maxWidth="sm" sx={{ pb: 4 }}>
      {/* 搜索栏 */}
      <Box sx={{ py: 3 }}>
        <TextField
          fullWidth
          placeholder="搜索单词..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      {/* 标签筛选 */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto' }}>
        <Chip label="全部" clickable color={selectedTag === null ? 'primary' : 'default'} onClick={() => setSelectedTag(null)} />
        <Chip label="今天" clickable color={selectedTag === 'today' ? 'primary' : 'default'} onClick={() => setSelectedTag('today')} />
        <Chip label="本周" clickable color={selectedTag === 'week' ? 'primary' : 'default'} onClick={() => setSelectedTag('week')} />
      </Box>

      {/* 单词列表 */}
      {filteredWords.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            还没有生词
          </Typography>
          <Typography variant="body2" color="text.secondary">
            开始拍照学习吧！
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/camera')}>
            去拍照
          </Button>
        </Box>
      ) : (
        <List>
          {filteredWords.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" fontWeight={600}>
                        {item.word.english_word}
                      </Typography>
                      <IconButton size="small" onClick={() => playAudio(item.word.english_word)}>
                        <VolumeUp fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {item.word.chinese_meaning}
                    </Typography>
                    <Chip label={item.tag?.tag_name} size="small" sx={{ mt: 1 }} />
                  </Box>
                  <IconButton onClick={() => deleteWord(item.id)} color="error">
                    <Delete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
      )}
    </Container>
  );
};
```

---

## 第四部分：实施步骤

### 第一阶段：项目重构（核心功能）

#### 步骤 1：创建新项目
```bash
# 1. 使用 Vite 创建新项目
npm create vite@latest photo-english-learn-frontend -- --template react-ts

# 2. 进入项目目录
cd photo-english-learn-frontend

# 3. 安装所有依赖
npm install react-router-dom axios @mui/material @mui/icons-material @emotion/react @emotion/styled react-hook-form zod dayjs

# 4. 安装开发依赖
npm install -D @types/node
```

#### 步骤 2：配置环境变量
创建 `.env.development` 和 `.env.production` 文件，添加所有后端服务 URLs。

#### 步骤 3：实现核心功能
1. 创建 API 客户端 (`src/api/client.ts`)
2. 创建 API 服务 (`src/api/services.ts`)
3. 创建图片上传服务 (`src/api/image-upload.ts`)
4. 实现 AuthContext (`src/contexts/AuthContext.tsx`)
5. 实现 ProtectedRoute (`src/components/common/ProtectedRoute.tsx`)
6. 配置 Material-UI 主题 (`src/theme/index.ts`)

#### 步骤 4：实现所有页面
按照上面的改造方案，逐个实现页面：
1. 登录页面
2. 注册页面
3. 首页
4. 相机页面
5. 识别结果页面
6. 生词本页面
7. 练习页面
8. 个人中心页面

#### 步骤 5：配置路由
```typescript
// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme } from './theme';
import { ProtectedRoute } from './components/common/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            {/* ... 其他路由 */}
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
```

---

### 第二阶段：优化和部署

#### 步骤 6：添加错误处理和加载状态
```typescript
// 使用 React Query 或自定义 Hook
const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = async (fn: () => Promise<any>) => {
    try {
      setLoading(true);
      setError(null);
      return await fn();
    } catch (err: any) {
      setError(err.response?.data?.message || '操作失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, call };
};
```

#### 步骤 7：响应式优化
- 确保所有页面在手机、平板、桌面都能正常显示
- 使用 MUI 的 Grid 系统实现响应式布局
- 测试不同屏幕尺寸

#### 步骤 8：性能优化
- 图片懒加载
- 路由代码分割
- 列表虚拟化（长列表）

#### 步骤 9：部署到 Netlify
1. 创建 `netlify.toml` 配置文件
2. 推送代码到 GitHub
3. 在 Netlify 导入项目
4. 配置环境变量
5. 部署

#### 步骤 10：更新后端 CORS
在所有后端服务的 `main.py` 中添加 Netlify 域名到 `allow_origins`。

---

## 第五部分：验证清单

### 功能验证
- [ ] 用户可以注册和登录
- [ ] 登录后 Token 正确存储
- [ ] 未登录无法访问受保护页面
- [ ] 相机功能正常工作
- [ ] 图片可以上传到图床
- [ ] Vision Service 可以识别图片
- [ ] 识别结果显示正确
- [ ] 可以添加单词到生词本
- [ ] 生词本数据保存到后端数据库
- [ ] 刷新页面后数据不丢失
- [ ] TTS 发音功能正常
- [ ] 练习功能正常工作
- [ ] 所有错误都有友好提示

### UI 验证
- [ ] 所有页面使用 Material Design 3 风格
- [ ] 颜色符合可访问性标准
- [ ] 文字清晰易读
- [ ] 按钮足够大，易于点击
- [ ] 加载状态清晰显示
- [ ] 错误提示友好
- [ ] 移动端显示正常
- [ ] 平板和桌面显示正常

### 性能验证
- [ ] 首屏加载时间 < 3秒
- [ ] 页面切换流畅
- [ ] 没有内存泄漏
- [ ] 图片加载优化
- [ ] 列表滚动流畅

---

## 第六部分：参考资源

### Material Design 3
- 官方文档: https://m3.material.io/
- 组件库: https://mui.com/
- 颜色工具: https://material.io/resources/color/
- 字体系统: https://m3.material.io/styles/typography

### React 生态
- React Router: https://reactrouter.com/
- Axios: https://axios-http.com/
- React Hook Form: https://react-hook-form.com/
- Zod: https://zod.dev/

### 设计资源
- Figma 社区: https://www.figma.com/community
- Material Design 3 Figma Kit: 官方提供
- Undraw 插画: https://undraw.co/

### 图床服务
- ImgBB: https://imgbb.com/ (免费)
- Cloudinary: https://cloudinary.com/ (付费但更强大)

---

## 总结

这份提示词涵盖了从问题分析到完整改造的所有内容：

1. **8个严重问题** - 清晰指出当前代码的问题
2. **完整改造方案** - Material Design 3 UI + 后端集成
3. **详细代码示例** - 每个功能都有可运行的代码
4. **分阶段实施** - 10个步骤，循序渐进
5. **验证清单** - 确保质量

**核心改造目标**：
- ✅ 从赛博朋克风格改为 Material Design 3
- ✅ 从直接调用 Gemini 改为调用后端 API
- ✅ 从 localStorage 改为数据库持久化
- ✅ 从状态路由改为 React Router
- ✅ 实现完整的用户认证系统

**预期效果**：
- 🎨 简洁专业的界面
- 📱 完美的移动端体验
- 💾 可靠的数据持久化
- 🔒 安全的用户认证
- 🚀 生产就绪的代码

现在开始改造吧！💪
