# 前端应用重新设计提示词 - 严格执行版

> ⚠️ **重要提醒**：你必须严格按照本文档的所有要求执行，不得跳过任何步骤，不得自行修改或简化任何要求。

---

## 📋 执行规则（必须遵守）

### 规则 1：严格按照分步要求执行
- 你必须按照文档中的顺序，一步一步执行
- 每一步完成后，必须确认完成后才能进行下一步
- 不允许跳过任何步骤

### 规则 2：代码必须完全匹配
- 所有代码示例必须完全按照文档要求编写
- 不允许"简化"或"优化"代码示例
- TypeScript 类型必须完全匹配文档定义

### 规则 3：UI 必须使用 Material-UI
- 所有页面必须使用 Material-UI v5 组件
- 不允许使用 Tailwind CSS
- 不允许使用自定义样式类
- 所有样式必须通过 `sx` prop 或 Material-UI 主题系统实现

### 规则 4：必须连接后端 API
- 不允许直接调用 Gemini API
- 所有 AI 调用必须通过后端服务
- 图片必须先上传到图床获取 URL

### 规则 5：必须使用 React Router
- 不允许使用 useState 管理路由
- 必须使用 react-router-dom v6
- 所有路由必须配置正确

---

## 第一阶段：项目初始化（必须完成）

### 步骤 1.1：创建项目结构

**执行命令**：
```bash
npm create vite@latest photo-english-learn-frontend -- --template react-ts
cd photo-english-learn-frontend
```

### 步骤 1.2：安装依赖（必须全部安装）

**执行命令**：
```bash
npm install react-router-dom axios @mui/material @mui/icons-material @emotion/react @emotion/styled react-hook-form zod dayjs
npm install -D @types/node
```

**验证**：检查 package.json 是否包含所有依赖：
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.7",
    "@mui/material": "^5.15.11",
    "@mui/icons-material": "^5.15.11",
    "@emotion/react": "^11.11.4",
    "@emotion/styled": "^11.11.0",
    "react-hook-form": "^7.51.0",
    "zod": "^3.22.4",
    "dayjs": "^1.11.10"
  }
}
```

### 步骤 1.3：配置环境变量

**创建文件：`.env.development`**
```bash
VITE_AUTH_SERVICE_URL=http://localhost:8001
VITE_VISION_SERVICE_URL=http://localhost:8003
VITE_WORD_SERVICE_URL=http://localhost:8004
VITE_PRACTICE_SERVICE_URL=http://localhost:8005
VITE_TTS_SERVICE_URL=http://localhost:8006
IMGBB_API_KEY=your_imgbb_api_key_here
```

**创建文件：`.env.production`**
```bash
VITE_AUTH_SERVICE_URL=https://photo-english-learn-auth-service.zeabur.app
VITE_VISION_SERVICE_URL=https://vision-service.zeabur.app
VITE_WORD_SERVICE_URL=https://word-service.zeabur.app
VITE_PRACTICE_SERVICE_URL=https://practice-service.zeabur.app
VITE_TTS_SERVICE_URL=https://tts-service.zeabur.app
```

### 步骤 1.4：创建文件夹结构

**执行命令**：
```bash
cd src
mkdir -p api components/{common,auth,camera,word,practice} contexts pages types theme utils
cd ..
```

**验证结构**：
```
src/
├── api/
├── components/
│   ├── common/
│   ├── auth/
│   ├── camera/
│   ├── word/
│   └── practice/
├── contexts/
├── pages/
├── types/
├── theme/
└── utils/
```

---

## 第二阶段：类型定义（必须完成）

### 步骤 2.1：创建用户类型

**文件路径：`src/types/user.ts`**

**必须完全按照以下代码编写**：
```typescript
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

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}
```

### 步骤 2.2：创建词汇类型

**文件路径：`src/types/word.ts`**

**必须完全按照以下代码编写**：
```typescript
export interface Word {
  word_id: number;
  english_word: string;
  chinese_meaning: string;
  phonetic_us?: string;
  phonetic_uk?: string;
  audio_url?: string;
  example_sentence?: string;
  example_translation?: string;
  image_url?: string;
}

export interface UserWord {
  id: number;
  user_id: number;
  word_id: number;
  scene_id?: number;
  tag_id: number;
  created_at: string;
  word?: Word;
  tag?: Tag;
}

export interface Tag {
  tag_id: number;
  tag_name: string;
  description?: string;
  color: string;
}
```

### 步骤 2.3：创建场景类型

**文件路径：`src/types/scene.ts`**

**必须完全按照以下代码编写**：
```typescript
export interface Scene {
  scene_id: number;
  user_id: number;
  image_url: string;
  description?: string;
  created_at: string;
}

export interface DetectedObject {
  object_id: number;
  scene_id: number;
  object_name: string;
  english_word: string;
  confidence: number;
}

export interface AnalyzedScene {
  scene_id: number;
  image_url: string;
  description?: string;
  detected_objects: DetectedObject[];
}
```

### 步骤 2.4：创建 API 类型

**文件路径：`src/types/api.ts`**

**必须完全按照以下代码编写**：
```typescript
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface ApiError {
  code: number;
  message: string;
  detail?: string;
}
```

### 步骤 2.5：创建类型索引

**文件路径：`src/types/index.ts`**

**必须完全按照以下代码编写**：
```typescript
export * from './user';
export * from './word';
export * from './scene';
export * from './api';
```

---

## 第三阶段：API 客户端（必须完成）

### 步骤 3.1：创建 Axios 客户端

**文件路径：`src/api/client.ts`**

**必须完全按照以下代码编写，不允许修改**：
```typescript
import axios, { AxiosError } from 'axios';

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
    (error: AxiosError) => {
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

### 步骤 3.2：创建 API 服务

**文件路径：`src/api/services.ts`**

**必须完全按照以下代码编写**：
```typescript
import { api } from './client';
import type {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Word,
  UserWord,
  AnalyzedScene
} from '../types';

// 认证服务
export const authService = {
  register: (data: RegisterRequest) =>
    api.auth.post<any, AuthResponse>('/register', data),

  login: (data: LoginRequest) =>
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

### 步骤 3.3：创建图片上传服务

**文件路径：`src/api/image-upload.ts`**

**必须完全按照以下代码编写**：
```typescript
export const uploadImage = async (file: File): Promise<string> => {
  const IMGBB_API_KEY = import.meta.env.IMGBB_API_KEY;

  if (!IMGBB_API_KEY || IMGBB_API_KEY === 'your_imgbb_api_key_here') {
    throw new Error('ImgBB API Key not configured');
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
    { method: 'POST', body: formData }
  );

  const data = await response.json();

  if (data.success) {
    return data.data.url;
  } else {
    throw new Error('Image upload failed');
  }
};
```

---

## 第四阶段：Material-UI 主题（必须完成）

### 步骤 4.1：创建主题配置

**文件路径：`src/theme/index.ts`**

**必须完全按照以下代码编写**：
```typescript
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
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '0.875rem',
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
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
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
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#ce93d8',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});
```

---

## 第五阶段：认证上下文（必须完成）

### 步骤 5.1：创建 AuthContext

**文件路径：`src/contexts/AuthContext.tsx`**

**必须完全按照以下代码编写**：
```typescript
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

---

## 第六阶段：公共组件（必须完成）

### 步骤 6.1：创建 ProtectedRoute

**文件路径：`src/components/common/ProtectedRoute.tsx`**

**必须完全按照以下代码编写**：
```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

### 步骤 6.2：创建 LoadingSpinner

**文件路径：`src/components/common/LoadingSpinner.tsx`**

**必须完全按照以下代码编写**：
```typescript
import React from 'react';
import { CircularProgress, Box } from '@mui/material';

export const LoadingSpinner: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
};
```

### 步骤 6.3：创建 ErrorAlert

**文件路径：`src/components/common/ErrorAlert.tsx`**

**必须完全按照以下代码编写**：
```typescript
import React from 'react';
import { Alert, AlertTitle } from '@mui/material';

interface ErrorAlertProps {
  message: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => {
  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <AlertTitle>错误</AlertTitle>
      {message}
    </Alert>
  );
};
```

---

## 第七阶段：页面组件（必须按顺序完成）

### 步骤 7.1：创建登录页面

**文件路径：`src/pages/Login.tsx`**

**必须完全按照以下代码编写，使用 Material-UI 组件**：
```typescript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight={600}>
          欢迎回来
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          登录拍照学英语，继续你的学习之旅
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="用户名"
            margin="normal"
            variant="outlined"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="密码"
            type="password"
            margin="normal"
            variant="outlined"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </Button>

          <Typography align="center" variant="body2">
            还没有账号？{' '}
            <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
              立即注册
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
```

### 步骤 7.2：创建注册页面

**文件路径：`src/pages/Register.tsx`**

**必须完全按照以下代码编写**：
```typescript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { api } from '../api/client';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.auth.post('/register', {
        username,
        email,
        password,
        nickname: nickname || undefined,
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight={600}>
          创建账号
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          加入拍照学英语，开始你的学习之旅
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="用户名"
            margin="normal"
            variant="outlined"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="邮箱"
            type="email"
            margin="normal"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="密码"
            type="password"
            margin="normal"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="昵称（可选）"
            margin="normal"
            variant="outlined"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? '注册中...' : '注册'}
          </Button>

          <Typography align="center" variant="body2">
            已有账号？{' '}
            <Link to="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
              立即登录
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage;
```

### 步骤 7.3：创建首页

**文件路径：`src/pages/Home.tsx`**

**必须完全按照以下代码编写**：
```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { CameraAlt, MenuBook, Psychology } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
          '&:hover': { boxShadow: 6 },
        }}
        onClick={() => navigate('/camera')}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CameraAlt sx={{ fontSize: 48, mr: 2 }} />
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
          <Card sx={{ height: '100%', cursor: '&:hover': { boxShadow: 3 } }} onClick={() => navigate('/words')}>
            <CardContent>
              <MenuBook color="primary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                生词本
              </Typography>
              <Typography variant="body2" color="text.secondary">
                查看已保存的单词
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/practice')}>
            <CardContent>
              <Psychology color="secondary" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                练习
              </Typography>
              <Typography variant="body2" color="text.secondary">
                复习学过的内容
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
```

### 步骤 7.4：创建相机页面

**文件路径：`src/pages/Camera.tsx`**

**必须完全按照以下代码编写**：
```typescript
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Fab, Paper, Typography, CircularProgress } from '@mui/material';
import { CameraAlt, PhotoLibrary, ArrowBack } from '@mui/icons-material';
import { uploadImage } from '../api/image-upload';
import { visionService } from '../api/services';

const CameraPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('无法访问相机:', err);
    }
  };

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setPreviewUrl(canvas.toDataURL('image/jpeg'));
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleSelectFromGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleRetake = () => {
    setPreviewUrl(null);
    startCamera();
  };

  const handleAnalyze = async () => {
    if (!previewUrl) return;

    setLoading(true);
    try {
      // 转换 base64 为 File
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });

      // 上传到图床
      const imageUrl = await uploadImage(file);

      // 调用后端 API
      const result = await visionService.analyzeImage(imageUrl);

      // 跳转到结果页面
      navigate('/result', { state: { result } });
    } catch (err) {
      console.error('识别失败:', err);
      alert('识别失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 顶部栏 */}
      <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Button onClick={() => navigate(-1)} startIcon={<ArrowBack />}>
          返回
        </Button>
        <Typography variant="h6" sx={{ ml: 2, flex: 1, textAlign: 'center' }}>
          拍照学英语
        </Typography>
        <Box sx={{ width: 64 }} />
      </Paper>

      {/* 相机预览区 */}
      <Box sx={{ flex: 1, position: 'relative', bgcolor: 'black' }}>
        {loading ? (
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        ) : previewUrl ? (
          <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
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
            <Box sx={{ width: 48 }} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" fullWidth onClick={handleRetake}>
              重新拍摄
            </Button>
            <Button variant="contained" fullWidth onClick={handleAnalyze} disabled={loading}>
              {loading ? '识别中...' : '开始识别'}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CameraPage;
```

---

## 第八阶段：配置路由和 App（必须完成）

### 步骤 8.1：配置 main.tsx

**文件路径：`src/main.tsx`**

**必须完全按照以下代码编写**：
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme } from './theme';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
```

### 步骤 8.2：配置 App.tsx

**文件路径：`src/App.tsx`**

**必须完全按照以下代码编写**：
```typescript
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import HomePage from './pages/Home';
import CameraPage from './pages/Camera';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/camera"
            element={
              <ProtectedRoute>
                <CameraPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

### 步骤 8.3：创建 index.css

**文件路径：`src/index.css`**

**必须完全按照以下代码编写**：
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Roboto', 'Noto Sans SC', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
}
```

---

## 第九阶段：验证清单（必须全部完成）

### 功能验证

在继续之前，必须验证以下所有功能：

- [ ] 项目可以使用 `npm run dev` 正常启动
- [ ] 访问 http://localhost:5173 显示登录页面
- [ ] 登录页面使用 Material-UI 组件
- [ ] 可以输入用户名和密码
- [ ] 点击"立即注册"跳转到注册页面
- [ ] 注册页面使用 Material-UI 组件
- [ ] 注册成功后跳转到登录页面
- [ ] 登录成功后跳转到首页
- [ ] 首页显示用户名
- [ ] 点击"拍照识别"跳转到相机页面
- [ ] 相机页面可以打开设备相机
- [ ] 可以拍照并预览
- [ ] 可以从相册选择图片
- [ ] 点击"开始识别"调用后端 API（需要后端服务运行）

---

## 执行要求总结

### 你必须做到：

1. ✅ 严格按照文档顺序执行，不跳过任何步骤
2. ✅ 所有代码必须完全按照文档要求编写
3. ✅ 所有页面必须使用 Material-UI v5 组件
4. ✅ 不允许使用 Tailwind CSS 或其他 UI 库
5. ✅ 必须连接后端 API，不允许直接调用 Gemini
6. ✅ 必须使用 React Router，不允许用 useState 管理路由
7. ✅ 必须实现完整的认证系统
8. ✅ 必须使用 TypeScript，所有类型必须正确定义

### 你禁止做的：

1. ❌ 不允许简化或省略任何代码
2. ❌ 不允许使用自定义样式类
3. ❌ 不允许使用 Tailwind CSS
4. ❌ 不允许直接调用 Gemini API
5. ❌ 不允许使用 useState 管理页面路由
6. ❌ 不允许跳过任何步骤

---

## 开始执行

现在请严格按照以上 9 个阶段的顺序，一步一步完成开发。

**请回答以下问题确认你已理解**：
1. 你理解必须使用 Material-UI v5 组件吗？
2. 你理解必须连接后端 API 吗？
3. 你理解必须使用 React Router 吗？
4. 你理解必须按照文档顺序执行吗？

确认后，请从"第一阶段：项目初始化"开始执行。
