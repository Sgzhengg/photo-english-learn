# 前端开发提示词 - 赛博朋克风格 + Zeabur 后端集成

你是一位专业的前端开发工程师。请为"Photo English Learn（拍照学英语）"项目开发一个完整的前端应用。

**UI 风格**：赛博朋克/霓虹灯风格（深色主题、发光效果、玻璃态）
**后端服务**：5 个微服务已部署在 Zeabur

---

## 🎨 UI 设计风格（严格遵循）

### 配色方案

```typescript
// 必须使用的颜色定义
const colors = {
  // 背景色
  background: '#0A0E17',      // 深黑背景
  surface: '#121826',         // 卡片背景

  // 霓虹色系
  neonBlue: '#00f2ff',        // 主色 - 霓虹蓝
  neonPurple: '#bc13fe',      // 辅助色 - 霓虹紫
  neonPink: '#FF00E5',        // 强调色 - 霓虹粉
  cyberPurple: '#7000FF',     // 深紫色

  // 文字色（必须保证对比度）
  textPrimary: '#ffffff',     // 主要文字 - 纯白
  textSecondary: '#e0e0e0',   // 次要文字 - 浅灰
  textTertiary: '#b0b0b0',    // 第三级文字 - 中灰
};
```

### 特殊效果（必须实现）

#### 1. 霓虹灯发光效果
```css
.neon-glow-blue {
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.5);
}

.neon-glow-purple {
  box-shadow: 0 0 20px rgba(188, 19, 254, 0.5);
}
```

#### 2. 玻璃态卡片效果
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
```

#### 3. 渐变背景
```css
.gradient-primary {
  background: linear-gradient(135deg, #00f2ff 0%, #bc13fe 100%);
}

.gradient-secondary {
  background: linear-gradient(135deg, #bc13fe 0%, #7000FF 100%);
}
```

#### 4. 网格背景
```css
.mesh-bg {
  background-color: #0A0E17;
  background-image:
    radial-gradient(at 0% 0%, rgba(18, 24, 38, 0.8) 0, transparent 50%),
    radial-gradient(at 100% 100%, rgba(18, 24, 38, 0.8) 0, transparent 50%),
    radial-gradient(at 50% 50%, rgba(0, 242, 255, 0.05) 0, transparent 50%);
}
```

### Material-UI 主题配置（必须使用）

```typescript
import { createTheme } from '@mui/material/styles';

export const cyberpunkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00f2ff',
      light: '#4dffff',
      dark: '#009cb3',
      contrastText: '#000000',
    },
    secondary: {
      main: '#bc13fe',
      light: '#e94fff',
      dark: '#8a00c4',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0A0E17',
      paper: '#121826',
    },
    text: {
      primary: '#ffffff',
      secondary: '#e0e0e0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Noto Sans SC", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#00f2ff',
      textShadow: '0 0 12px rgba(0, 242, 255, 0.5)',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #00f2ff 0%, #bc13fe 100%)',
          color: '#000000',
          '&:hover': {
            boxShadow: '0 0 25px rgba(0, 242, 255, 0.5)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: '#00f2ff',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00f2ff',
              boxShadow: '0 0 10px rgba(0, 242, 255, 0.3)',
            },
          },
        },
      },
    },
  },
});
```

---

## 🚀 技术栈要求

### 必须使用
- React 18 + TypeScript
- Vite 5
- **Material-UI v5**（所有 UI 组件）
- React Router v6
- Axios
- Emotion / styled-components

### 样式方案
- 使用 Material-UI 的 `sx` prop
- 或使用 `@emotion/styled` 创建自定义样式组件
- 或使用 Tailwind CSS（如果熟悉）

---

## 🔗 后端服务配置

### Zeabur 后端 URLs（生产环境）

```bash
VITE_AUTH_SERVICE_URL=https://photo-english-learn-auth-service.zeabur.app
VITE_VISION_SERVICE_URL=https://vision-service.zeabur.app
VITE_WORD_SERVICE_URL=https://word-service.zeabur.app
VITE_PRACTICE_SERVICE_URL=https://practice-service.zeabur.app
VITE_TTS_SERVICE_URL=https://tts-service.zeabur.app
```

### 本地开发环境（开发时使用）

```bash
VITE_AUTH_SERVICE_URL=http://localhost:8001
VITE_VISION_SERVICE_URL=http://localhost:8003
VITE_WORD_SERVICE_URL=http://localhost:8004
VITE_PRACTICE_SERVICE_URL=http://localhost:8005
VITE_TTS_SERVICE_URL=http://localhost:8006
```

---

## 📁 项目结构

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
│   └── ui/
│       ├── GlassCard.tsx      # 玻璃态卡片组件
│       ├── NeonButton.tsx     # 霓虹灯按钮组件
│       └── CyberTextField.tsx # 赛博朋克输入框
├── contexts/
│   └── AuthContext.tsx
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
│   └── scene.ts
├── theme/
│   └── index.ts               # 赛博朋克主题配置
├── App.tsx
└── main.tsx
```

---

## 🔌 API 接口文档

### 1. Auth Service（认证服务）

**Base URL:** `https://photo-english-learn-auth-service.zeabur.app`

```typescript
// POST /register - 用户注册
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

// POST /login - 用户登录
Request: {
  username: string;
  password: string;
}
Response: 同上

// GET /me - 获取当前用户
Headers: Authorization: Bearer {token}
Response: {
  code: 200;
  message: "success";
  data: User;
}
```

### 2. Vision Service（视觉识别服务）

**Base URL:** `https://vision-service.zeabur.app`

```typescript
// POST /analyze - 分析图像
Headers: Authorization: Bearer {token}
Request: {
  image_url: string;  // 图片 URL
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

**Base URL:** `https://word-service.zeabur.app`

```typescript
// GET /lookup/{word} - 查询单词
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

// POST /add - 添加生词
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

// GET /list - 获取生词列表
Query: ?tag_id=number&search=string
Response: {
  code: 200;
  message: "success";
  data: UserWord[];
}
```

### 4. TTS Service（语音合成服务）

**Base URL:** `https://tts-service.zeabur.app`

```typescript
// POST /synthesize - 合成语音
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

## 💻 完整代码实现

### 步骤 1：创建项目

```bash
npm create vite@latest photo-english-learn-frontend -- --template react-ts
cd photo-english-learn-frontend
npm install react-router-dom axios @mui/material @mui/icons-material @emotion/react @emotion/styled
npm install -D @types/node
```

### 步骤 2：配置环境变量

创建 `.env.production`：
```bash
VITE_AUTH_SERVICE_URL=https://photo-english-learn-auth-service.zeabur.app
VITE_VISION_SERVICE_URL=https://vision-service.zeabur.app
VITE_WORD_SERVICE_URL=https://word-service.zeabur.app
VITE_PRACTICE_SERVICE_URL=https://practice-service.zeabur.app
VITE_TTS_SERVICE_URL=https://tts-service.zeabur.app
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

### 步骤 5：赛博朋克主题配置

**src/theme/index.ts**
```typescript
import { createTheme } from '@mui/material/styles';

export const cyberpunkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00f2ff',
      light: '#4dffff',
      dark: '#009cb3',
      contrastText: '#000000',
    },
    secondary: {
      main: '#bc13fe',
      light: '#e94fff',
      dark: '#8a00c4',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0A0E17',
      paper: '#121826',
    },
    text: {
      primary: '#ffffff',
      secondary: '#e0e0e0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Noto Sans SC", sans-serif',
    h4: {
      fontWeight: 700,
      color: '#00f2ff',
      textShadow: '0 0 12px rgba(0, 242, 255, 0.5)',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #00f2ff 0%, #bc13fe 100%)',
          color: '#000000',
          '&:hover': {
            boxShadow: '0 0 25px rgba(0, 242, 255, 0.5)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: '#00f2ff',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00f2ff',
              boxShadow: '0 0 10px rgba(0, 242, 255, 0.3)',
            },
          },
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

### 步骤 7：自定义 UI 组件（赛博朋克风格）

**src/components/ui/GlassCard.tsx**
```typescript
import React from 'react';
import { Paper } from '@mui/material';

interface GlassCardProps {
  children: React.ReactNode;
  sx?: any;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, sx }) => {
  return (
    <Paper
      sx={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 3,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
};
```

**src/components/ui/NeonText.tsx**
```typescript
import React from 'react';
import { Typography, TypographyProps } from '@mui/material';

interface NeonTextProps extends TypographyProps {
  color?: 'blue' | 'purple' | 'pink';
}

export const NeonText: React.FC<NeonTextProps> = ({ color = 'blue', sx, ...props }) => {
  const colorMap = {
    blue: '#00f2ff',
    purple: '#bc13fe',
    pink: '#FF00E5',
  };

  return (
    <Typography
      sx={{
        color: colorMap[color],
        textShadow: `0 0 12px ${colorMap[color]}80`,
        ...sx,
      }}
      {...props}
    />
  );
};
```

### 步骤 8：页面组件（完整实现）

**src/pages/Login.tsx**
```typescript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';

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
    <Container maxWidth="sm" sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #0A0E17 0%, #121826 100%)'
    }}>
      <GlassCard sx={{ p: 4, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight={700}>
          欢迎回来
        </Typography>
        <Typography variant="body2" align="center" sx={{ mb: 3, color: '#e0e0e0' }}>
          登录拍照学英语
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
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: '#00f2ff' },
                '&.Mui-focused fieldset': {
                  borderColor: '#00f2ff',
                  boxShadow: '0 0 10px rgba(0, 242, 255, 0.3)'
                },
              },
            }}
          />
          <TextField
            fullWidth
            label="密码"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.2)' },
                '&:hover fieldset': { borderColor: '#00f2ff' },
                '&.Mui-focused fieldset': {
                  borderColor: '#00f2ff',
                  boxShadow: '0 0 10px rgba(0, 242, 255, 0.3)'
                },
              },
            }}
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            sx={{
              mt: 3,
              mb: 2,
              background: 'linear-gradient(135deg, #00f2ff 0%, #bc13fe 100%)',
              color: '#000',
              fontWeight: 600,
              '&:hover': {
                boxShadow: '0 0 25px rgba(0, 242, 255, 0.5)',
              },
            }}
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </Button>
          <Typography align="center" variant="body2" sx={{ color: '#e0e0e0' }}>
            还没有账号？{' '}
            <Link to="/register" style={{ color: '#00f2ff', textDecoration: 'none' }}>
              立即注册
            </Link>
          </Typography>
        </Box>
      </GlassCard>
    </Container>
  );
}
```

**src/pages/Register.tsx**
```typescript
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { api } from '../api/client';
import { GlassCard } from '../components/ui/GlassCard';

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
    <Container maxWidth="sm" sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #0A0E17 0%, #121826 100%)'
    }}>
      <GlassCard sx={{ p: 4, width: '100%' }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight={700}>
          创建账号
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField fullWidth label="用户名" margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <TextField fullWidth label="邮箱" type="email" margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <TextField fullWidth label="密码" type="password" margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Button
            fullWidth
            variant="contained"
            size="large"
            type="submit"
            sx={{
              mt: 3,
              mb: 2,
              background: 'linear-gradient(135deg, #00f2ff 0%, #bc13fe 100%)',
              color: '#000',
              fontWeight: 600,
              '&:hover': {
                boxShadow: '0 0 25px rgba(0, 242, 255, 0.5)',
              },
            }}
            disabled={loading}
          >
            {loading ? '注册中...' : '注册'}
          </Button>
          <Typography align="center" variant="body2" sx={{ color: '#e0e0e0' }}>
            已有账号？{' '}
            <Link to="/login" style={{ color: '#00f2ff', textDecoration: 'none' }}>
              立即登录
            </Link>
          </Typography>
        </Box>
      </GlassCard>
    </Container>
  );
}
```

**src/pages/Home.tsx**
```typescript
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Grid, Card, CardContent, Typography, Button, Chip } from '@mui/material';
import { CameraAlt, MenuBook, Psychology } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { GlassCard } from '../components/ui/GlassCard';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Container maxWidth="sm" sx={{ pb: 10, background: '#0A0E17', minHeight: '100vh' }}>
      {/* 顶部欢迎区 */}
      <Box sx={{ pt: 4, pb: 3 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: '#ffffff' }}>
          你好，{user?.username} 👋
        </Typography>
        <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
          今天想学什么新单词呢？
        </Typography>
        <Chip
          label="AI 视觉学习助手"
          sx={{
            mt: 1,
            background: 'linear-gradient(135deg, #00f2ff 0%, #bc13fe 100%)',
            color: '#000',
            fontWeight: 600,
          }}
        />
      </Box>

      {/* 主要功能卡片 */}
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #00f2ff 0%, #bc13fe 100%)',
          color: '#000000',
          cursor: 'pointer',
          borderRadius: 3,
          border: '1px solid rgba(0, 242, 255, 0.3)',
          '&:hover': {
            boxShadow: '0 0 30px rgba(0, 242, 255, 0.4)',
            transform: 'scale(1.02)',
          },
          transition: 'all 0.3s',
        }}
        onClick={() => navigate('/camera')}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CameraAlt sx={{ fontSize: 48, mr: 2 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                拍照识别
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                拍摄物体，AI 帮你学习英语单词
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            fullWidth
            sx={{
              background: '#ffffff',
              color: '#00f2ff',
              fontWeight: 600,
              '&:hover': {
                background: '#f0f0f0',
              },
            }}
          >
            开始拍照
          </Button>
        </CardContent>
      </Card>

      {/* 功能卡片网格 */}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <GlassCard
            sx={{ height: '100%', cursor: 'pointer', p: 2 }}
            onClick={() => navigate('/words')}
          >
            <CardContent>
              <MenuBook sx={{ fontSize: 32, mb: 1, color: '#00f2ff' }} />
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#ffffff' }}>
                生词本
              </Typography>
              <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                查看已保存的单词
              </Typography>
            </CardContent>
          </GlassCard>
        </Grid>

        <Grid item xs={6}>
          <GlassCard
            sx={{ height: '100%', cursor: 'pointer', p: 2 }}
            onClick={() => navigate('/practice')}
          >
            <CardContent>
              <Psychology sx={{ fontSize: 32, mb: 1, color: '#bc13fe' }} />
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#ffffff' }}>
                练习
              </Typography>
              <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                复习学过的内容
              </Typography>
            </CardContent>
          </GlassCard>
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
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0A0E17' }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(18, 24, 38, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Button onClick={() => navigate(-1)} startIcon={<ArrowBack />} sx={{ color: '#fff' }}>
          返回
        </Button>
        <Typography variant="h6" sx={{ ml: 2, flex: 1, textAlign: 'center', color: '#00f2ff' }}>
          拍照学英语
        </Typography>
        <Box sx={{ width: 64 }} />
      </Paper>

      <Box sx={{ flex: 1, position: 'relative', bgcolor: 'black' }}>
        {loading ? (
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <CircularProgress sx={{ color: '#00f2ff' }} />
          </Box>
        ) : previewUrl ? (
          <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        ) : (
          <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 3,
          background: 'rgba(18, 24, 38, 0.9)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(0, 242, 255, 0.2)',
        }}
      >
        {!previewUrl ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, alignItems: 'center' }}>
            <Fab
              color="default"
              onClick={handleSelectFromGallery}
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <PhotoLibrary />
            </Fab>
            <Fab
              color="primary"
              sx={{
                width: 72,
                height: 72,
                background: 'linear-gradient(135deg, #00f2ff 0%, #bc13fe 100%)',
                '&:hover': {
                  boxShadow: '0 0 30px rgba(0, 242, 255, 0.6)',
                },
              }}
              onClick={handleCapture}
            >
              <CameraAlt sx={{ fontSize: 32 }} />
            </Fab>
            <Box sx={{ width: 48 }} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleRetake}
              sx={{
                borderColor: '#00f2ff',
                color: '#00f2ff',
                '&:hover': {
                  borderColor: '#4dffff',
                  background: 'rgba(0, 242, 255, 0.1)',
                },
              }}
            >
              重新拍摄
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleAnalyze}
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #00f2ff 0%, #bc13fe 100%)',
                color: '#000',
                fontWeight: 600,
                '&:hover': {
                  boxShadow: '0 0 25px rgba(0, 242, 255, 0.5)',
                },
                '&:disabled': {
                  background: '#555',
                  color: '#888',
                  boxShadow: 'none',
                },
              }}
            >
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
import { VolumeUp, BookmarkBorder, Bookmark } from '@mui/icons-material';
import { wordService } from '../api/services';

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const { result, imageUrl } = location.state || {};

  if (!result) {
    return (
      <Container maxWidth="sm" sx={{ textAlign: 'center', py: 8, background: '#0A0E17', minHeight: '100vh' }}>
        <Typography variant="h6" sx={{ color: '#fff' }}>没有识别结果</Typography>
        <Button
          variant="contained"
          sx={{
            mt: 2,
            background: 'linear-gradient(135deg, #00f2ff 0%, #bc13fe 100%)',
            color: '#000',
          }}
          onClick={() => navigate('/camera')}
        >
          去拍照
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ pb: 4, background: '#0A0E17', minHeight: '100vh' }}>
      {/* 图片预览 */}
      <Card
        sx={{
          mb: 3,
          border: '1px solid rgba(0, 242, 255, 0.3)',
          boxShadow: '0 0 20px rgba(0, 242, 255, 0.2)',
        }}
      >
        <img src={imageUrl || result.image_url} alt="Scene" style={{ width: '100%', height: 'auto' }} />
      </Card>

      {/* 场景描述 */}
      {result.description && (
        <Card
          sx={{
            mb: 3,
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#00f2ff' }}>
              场景描述
            </Typography>
            <Typography variant="body1" sx={{ color: '#e0e0e0' }}>
              {result.description}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* 识别到的单词 */}
      <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#00f2ff' }}>
        识别到的单词 ({result.detected_objects?.length || 0})
      </Typography>

      <List>
        {result.detected_objects?.map((obj: any, idx: number) => (
          <Card
            key={idx}
            sx={{
              mb: 2,
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{
                  bgcolor: 'linear-gradient(135deg, #00f2ff 0%, #bc13fe 100%)',
                  color: '#000',
                  fontWeight: 700,
                }}>
                  {obj.english_word[0].toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ color: '#fff' }}>
                      {obj.english_word}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" sx={{ color: '#e0e0e0' }}>
                      {obj.object_name}
                    </Typography>
                    <Chip
                      label={`置信度 ${obj.confidence}%`}
                      size="small"
                      color={obj.confidence > 80 ? 'success' : obj.confidence > 60 ? 'warning' : 'default'}
                      sx={{
                        mt: 1,
                        background: obj.confidence > 80
                          ? 'rgba(46, 125, 50, 0.3)'
                          : 'rgba(245, 124, 0, 0.3)',
                        color: '#fff',
                      }}
                    />
                  </Box>
                }
              />
              <IconButton
                onClick={() => {
                  wordService.addWord({ english_word: obj.english_word });
                  alert('已添加到生词本');
                }}
                sx={{ color: '#00f2ff' }}
              >
                <BookmarkBorder />
              </IconButton>
            </ListItem>
          </Card>
        ))}
      </List>

      {/* 底部操作 */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          fullWidth
          onClick={() => navigate('/camera')}
          sx={{
            borderColor: '#00f2ff',
            color: '#00f2ff',
            '&:hover': {
              background: 'rgba(0, 242, 255, 0.1)',
            },
          }}
        >
          继续拍照
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate('/words')}
          sx={{
            background: 'linear-gradient(135deg, #00f2ff 0%, #bc13fe 100%)',
            color: '#000',
            fontWeight: 600,
            '&:hover': {
              boxShadow: '0 0 25px rgba(0, 242, 255, 0.5)',
            },
          }}
        >
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
import { cyberpunkTheme } from './theme';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Camera from './pages/Camera';
import Result from './pages/Result';

function App() {
  return (
    <ThemeProvider theme={cyberpunkTheme}>
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

## ⚠️ 重要注意事项

### 1. 颜色对比度要求
虽然使用深色主题，但必须确保文字可读：
- 主要文字：纯白 (#ffffff)
- 次要文字：浅灰 (#e0e0e0)
- 避免使用中灰色或深灰色作为文字

### 2. 性能优化
- 使用 CSS 而不是图片实现渐变和效果
- 限制动画数量和时长
- 使用 `transform` 代替 `position` 动画

### 3. 响应式设计
- 主要目标：375px - 414px（手机屏幕）
- 最大宽度：480px（sm）
- 使用 MUI 的 Grid 系统实现响应式

### 4. 必须连接后端 API
- 不允许直接调用 Gemini API
- 所有 AI 调用必须通过 Zeabur 后端服务
- 图片必须先上传到图床获取 URL

---

## 🚀 部署到 Netlify

### 创建 netlify.toml

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

### 配置环境变量

在 Netlify Site settings → Environment variables 添加：
```bash
VITE_AUTH_SERVICE_URL=https://photo-english-learn-auth-service.zeabur.app
VITE_VISION_SERVICE_URL=https://vision-service.zeabur.app
VITE_WORD_SERVICE_URL=https://word-service.zeabur.app
VITE_PRACTICE_SERVICE_URL=https://practice-service.zeabur.app
VITE_TTS_SERVICE_URL=https://tts-service.zeabur.app
IMGBB_API_KEY=your_imgbb_api_key
```

---

## ✅ 验证清单

完成后请验证：
- [ ] 所有页面使用赛博朋克风格（深色背景、霓虹灯效果）
- [ ] 文字清晰可读（纯白或浅灰文字）
- [ ] 可以注册和登录（调用后端 Auth Service）
- [ ] 相机功能正常
- [ ] 拍照后调用后端 Vision Service API
- [ ] 识别结果正确显示
- [ ] 可以添加单词到生词本
- [ ] 所有按钮有霓虹灯悬停效果

---

现在请按照以上要求，完整实现这个赛博朋克风格的前端应用，确保与 Zeabur 后端服务完美连接。
