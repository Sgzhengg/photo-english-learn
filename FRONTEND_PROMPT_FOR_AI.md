# 拍照学英语 - 前端开发完整提示词

你是一位专业的前端开发工程师。请为"Photo English Learn（拍照学英语）"项目开发一个完整的前端应用。

## 核心要求（必须遵守）

### 1. 技术栈要求（必须使用）
- React 18 + TypeScript
- Vite 5
- **Material-UI v5**（所有 UI 组件必须使用 MUI）
- React Router v6
- Axios
- React Hook Form + Zod

### 2. 后端服务 URLs（已部署在 Zeabur）

**开发环境**：
```bash
VITE_AUTH_SERVICE_URL=http://localhost:8001
VITE_VISION_SERVICE_URL=http://localhost:8003
VITE_WORD_SERVICE_URL=http://localhost:8004
VITE_PRACTICE_SERVICE_URL=http://localhost:8005
VITE_TTS_SERVICE_URL=http://localhost:8006
```

**生产环境**：
```bash
VITE_AUTH_SERVICE_URL=https://photo-english-learn-auth-service.zeabur.app
VITE_VISION_SERVICE_URL=https://vision-service.zeabur.app
VITE_WORD_SERVICE_URL=https://word-service.zeabur.app
VITE_PRACTICE_SERVICE_URL=https://practice-service.zeabur.app
VITE_TTS_SERVICE_URL=https://tts-service.zeabur.app
```

### 3. 必须实现的功能
- ✅ 用户注册/登录（JWT 认证）
- ✅ 相机拍照/上传图片
- ✅ 图片上传到图床（使用 ImgBB）
- ✅ AI 图像识别（调用后端 Vision Service）
- ✅ 显示识别结果
- ✅ 生词本管理（调用后端 Word Service）
- ✅ 单词发音（调用后端 TTS Service）
- ✅ 练习功能（调用后端 Practice Service）
- ✅ 路由守卫（未登录自动跳转登录页）

### 4. 重要约束
- ❌ **不允许**直接调用 Gemini API
- ❌ **不允许**使用 Tailwind CSS
- ❌ **不允许**使用 useState 管理路由
- ❌ **不允许**使用 localStorage 存储业务数据
- ✅ **必须**调用后端微服务 API
- ✅ **必须**使用 React Router v6
- ✅ **必须**使用 Material-UI v5 组件

---

## 项目结构（必须按此结构）

```
src/
├── api/
│   ├── client.ts              # Axios 客户端配置
│   ├── services.ts            # API 服务封装
│   └── image-upload.ts        # 图片上传服务
├── components/
│   ├── common/
│   │   ├── ProtectedRoute.tsx
│   │   └── LoadingSpinner.tsx
│   └── auth/
│       ├── LoginForm.tsx
│       └── RegisterForm.tsx
├── contexts/
│   └── AuthContext.tsx        # 认证上下文
├── pages/
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Camera.tsx
│   ├── Result.tsx
│   ├── WordList.tsx
│   ├── Practice.tsx
│   └── Profile.tsx
├── types/
│   ├── user.ts
│   ├── word.ts
│   ├── scene.ts
│   └── api.ts
├── theme/
│   └── index.ts               # Material-UI 主题配置
├── App.tsx
└── main.tsx
```

---

## API 接口文档

### 1. Auth Service（认证服务）

**POST /register** - 用户注册
```typescript
Request: {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}
Response: {
  code: 200;
  message: "success";
  data: {
    access_token: string;
    user: User;
  }
}
```

**POST /login** - 用户登录
```typescript
Request: {
  username: string;
  password: string;
}
Response: {
  code: 200;
  message: "success";
  data: {
    access_token: string;
    user: User;
  }
}
```

**GET /me** - 获取当前用户
```typescript
Headers: Authorization: Bearer {token}
Response: {
  code: 200;
  message: "success";
  data: User;
}
```

### 2. Vision Service（视觉识别服务）

**POST /analyze** - 分析图像
```typescript
Headers: Authorization: Bearer {token}
Request: {
  image_url: string;
}
Response: {
  code: 200;
  message: "success";
  data: {
    scene_id: number;
    image_url: string;
    description: string;
    detected_objects: [
      {
        object_id: number;
        object_name: string;
        english_word: string;
        confidence: number;
      }
    ]
  }
}
```

### 3. Word Service（词汇服务）

**GET /lookup/{word}** - 查询单词
```typescript
Headers: Authorization: Bearer {token}
Response: {
  code: 200;
  message: "success";
  data: {
    word_id: number;
    english_word: string;
    chinese_meaning: string;
    phonetic_us?: string;
    audio_url?: string;
    example_sentence?: string;
  }
}
```

**POST /add** - 添加生词
```typescript
Headers: Authorization: Bearer {token}
Request: {
  word_id: number;
  scene_id?: number;
  tag_id?: number;
}
Response: {
  code: 200;
  message: "success";
  data: UserWord;
}
```

**GET /list** - 获取生词列表
```typescript
Headers: Authorization: Bearer {token}
Query: ?tag_id=number&search=string
Response: {
  code: 200;
  message: "success";
  data: UserWord[];
}
```

### 4. TTS Service（语音合成服务）

**POST /synthesize** - 合成语音
```typescript
Headers: Authorization: Bearer {token}
Request: {
  text: string;
  voice?: string;
}
Response: {
  code: 200;
  message: "success";
  data: {
    audio_url: string;
  }
}
```

---

## 完整代码实现

### 步骤 1：创建项目

```bash
npm create vite@latest photo-english-learn-frontend -- --template react-ts
cd photo-english-learn-frontend
npm install react-router-dom axios @mui/material @mui/icons-material @emotion/react @emotion/styled react-hook-form zod
npm install -D @types/node
```

### 步骤 2：配置环境变量

创建 `.env.development`：
```bash
VITE_AUTH_SERVICE_URL=http://localhost:8001
VITE_VISION_SERVICE_URL=http://localhost:8003
VITE_WORD_SERVICE_URL=http://localhost:8004
VITE_PRACTICE_SERVICE_URL=http://localhost:8005
VITE_TTS_SERVICE_URL=http://localhost:8006
IMGBB_API_KEY=your_imgbb_api_key
```

### 步骤 3：TypeScript 类型定义

**src/types/user.ts**
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
```

**src/types/word.ts**
```typescript
export interface Word {
  word_id: number;
  english_word: string;
  chinese_meaning: string;
  phonetic_us?: string;
  audio_url?: string;
}

export interface UserWord {
  id: number;
  user_id: number;
  word_id: number;
  scene_id?: number;
  tag_id: number;
  created_at: string;
  word?: Word;
}
```

**src/types/scene.ts**
```typescript
export interface AnalyzedScene {
  scene_id: number;
  image_url: string;
  description?: string;
  detected_objects: Array<{
    object_id: number;
    object_name: string;
    english_word: string;
    confidence: number;
  }>;
}
```

### 步骤 4：API 客户端配置

**src/api/client.ts**
```typescript
import axios from 'axios';

const BASE_URLS = {
  auth: import.meta.env.VITE_AUTH_SERVICE_URL,
  vision: import.meta.env.VITE_VISION_SERVICE_URL,
  word: import.meta.env.VITE_WORD_SERVICE_URL,
  practice: import.meta.env.VITE_PRACTICE_SERVICE_URL,
  tts: import.meta.env.VITE_TTS_SERVICE_URL,
};

const createApiClient = (baseURL: string) => {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const api = {
  auth: createApiClient(BASE_URLS.auth),
  vision: createApiClient(BASE_URLS.vision),
  word: createApiClient(BASE_URLS.word),
  practice: createApiClient(BASE_URLS.practice),
  tts: createApiClient(BASE_URLS.tts),
};
```

**src/api/services.ts**
```typescript
import { api } from './client';
import type { User, AuthResponse, Word, UserWord, AnalyzedScene } from '../types';

export const authService = {
  login: (username: string, password: string) =>
    api.auth.post<any, AuthResponse>('/login', { username, password }),
  register: (data: any) =>
    api.auth.post<any, AuthResponse>('/register', data),
  getCurrentUser: () =>
    api.auth.get<any, User>('/me'),
};

export const visionService = {
  analyzeImage: (imageUrl: string) =>
    api.vision.post<any, AnalyzedScene>('/analyze', { image_url: imageUrl }),
};

export const wordService = {
  lookup: (word: string) =>
    api.word.get<any, Word>(`/lookup/${word}`),
  addWord: (data: any) =>
    api.word.post<any, UserWord>('/add', data),
  getWordList: (params?: any) =>
    api.word.get<any, UserWord[]>('/list', { params }),
};

export const ttsService = {
  synthesize: (text: string) =>
    api.tts.post<any, { audio_url: string }>('/synthesize', { text }),
};
```

**src/api/image-upload.ts**
```typescript
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${import.meta.env.IMGBB_API_KEY}`,
    { method: 'POST', body: formData }
  );

  const data = await response.json();
  return data.data.url;
};
```

### 步骤 5：Material-UI 主题

**src/theme/index.ts**
```typescript
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#fefbff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Noto Sans SC", sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
  },
});
```

### 步骤 6：认证上下文

**src/contexts/AuthContext.tsx**
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
        } catch {
          setToken(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (username: string, password: string) => {
    const response = await authService.login(username, password);
    setToken(response.access_token);
    setUser(response.user);
    localStorage.setItem('access_token', response.access_token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 步骤 7：路由守卫组件

**src/components/common/ProtectedRoute.tsx**
```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

### 步骤 8：页面组件

**src/pages/Login.tsx**
```typescript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
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
      setError(err.response?.data?.message || '登录失败');
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="密码"
            type="password"
            margin="normal"
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
}
```

**src/pages/Register.tsx**
```typescript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { api } from '../api/client';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.auth.post('/register', { username, email, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败');
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

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth label="用户名" margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <TextField fullWidth label="邮箱" type="email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField fullWidth label="密码" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button fullWidth variant="contained" size="large" type="submit" sx={{ mt: 3, mb: 2 }} disabled={loading}>
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
}
```

**src/pages/Home.tsx**
```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { CameraAlt, MenuBook, Psychology } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Container maxWidth="sm" sx={{ pb: 10 }}>
      <Box sx={{ pt: 4, pb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          你好，{user?.username} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          今天想学什么新单词呢？
        </Typography>
      </Box>

      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          cursor: 'pointer',
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

      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate('/words')}>
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
}
```

**src/pages/Camera.tsx**
```typescript
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Fab, Paper, Typography, CircularProgress } from '@mui/material';
import { CameraAlt, PhotoLibrary, ArrowBack } from '@mui/icons-material';
import { uploadImage } from '../api/image-upload';
import { visionService } from '../api/services';

export default function Camera() {
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
      const response = await fetch(previewUrl);
      const blob = await response.blob();
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });

      const imageUrl = await uploadImage(file);
      const result = await visionService.analyzeImage(imageUrl);

      navigate('/result', { state: { result, imageUrl } });
    } catch (err) {
      console.error('识别失败:', err);
      alert('识别失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
        <Button onClick={() => navigate(-1)} startIcon={<ArrowBack />}>
          返回
        </Button>
        <Typography variant="h6" sx={{ ml: 2, flex: 1, textAlign: 'center' }}>
          拍照学英语
        </Typography>
        <Box sx={{ width: 64 }} />
      </Paper>

      <Box sx={{ flex: 1, position: 'relative', bgcolor: 'black' }}>
        {loading ? (
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CircularProgress sx={{ color: 'white' }} />
          </Box>
        ) : previewUrl ? (
          <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        {!previewUrl ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, alignItems: 'center' }}>
            <Fab color="default" onClick={handleSelectFromGallery}>
              <PhotoLibrary />
            </Fab>
            <Fab color="primary" sx={{ width: 72, height: 72 }} onClick={handleCapture}>
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
}
```

**src/pages/Result.tsx**
```typescript
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Card, CardContent, Typography, Chip, IconButton, Button, List, ListItem, ListItemAvatar, Avatar, ListItemText, Box } from '@mui/material';
import { VolumeUp, BookmarkBorder } from '@mui/icons-material';
import { wordService } from '../api/services';

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result, imageUrl } = location.state || {};

  if (!result) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6">没有识别结果</Typography>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/camera')}>
          去拍照
        </Button>
      </Container>
    );
  }

  const addToVocab = async (objectName: string) => {
    try {
      await wordService.addWord({ english_word: objectName });
      alert('已添加到生词本');
    } catch (err) {
      console.error('添加失败:', err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ pb: 4 }}>
      <Card sx={{ mb: 3 }}>
        <img src={imageUrl || result.image_url} alt="Scene" style={{ width: '100%', height: 'auto' }} />
      </Card>

      {result.description && (
        <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              场景描述
            </Typography>
            <Typography variant="body1">{result.description}</Typography>
          </CardContent>
        </Card>
      )}

      <Typography variant="h6" fontWeight={600} gutterBottom>
        识别到的单词 ({result.detected_objects?.length || 0})
      </Typography>

      <List>
        {result.detected_objects?.map((obj: any, idx: number) => (
          <Card key={idx} sx={{ mb: 2 }}>
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
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {obj.object_name}
                    </Typography>
                    <Chip
                      label={`置信度 ${obj.confidence}%`}
                      size="small"
                      color={obj.confidence > 80 ? 'success' : 'default'}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                }
              />
              <IconButton onClick={() => addToVocab(obj.english_word)}>
                <BookmarkBorder />
              </IconButton>
            </ListItem>
          </Card>
        ))}
      </List>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button variant="outlined" fullWidth onClick={() => navigate('/camera')}>
          继续拍照
        </Button>
        <Button variant="contained" fullWidth onClick={() => navigate('/words')}>
          查看生词本
        </Button>
      </Box>
    </Container>
  );
}
```

### 步骤 9：App.tsx 和 main.tsx

**src/App.tsx**
```typescript
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { lightTheme } from './theme';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Camera from './pages/Camera';
import Result from './pages/Result';

function App() {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
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
            <Route path="/result" element={
              <ProtectedRoute>
                <Result />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
```

**src/main.tsx**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## 验证清单

完成后请验证：
- [ ] 可以使用 `npm run dev` 启动项目
- [ ] 访问 http://localhost:5173 显示登录页面
- [ ] 所有页面使用 Material-UI 组件
- [ ] 可以注册和登录
- [ ] 登录后跳转到首页
- [ ] 点击拍照识别可以打开相机
- [ ] 拍照后调用后端 Vision Service API
- [ ] 识别结果正确显示
- [ ] 可以添加单词到生词本

现在请按照以上要求，完整实现这个前端应用。
