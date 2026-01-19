# 前端开发提示词 - 基于已导入的 UI 设计

你是一位专业的前端开发工程师。请根据已在 AI Studio 中的 UI 设计稿，为"Photo English Learn（拍照学英语）"项目开发完整的前端应用。

---

## 🎨 UI 设计要求

你已经可以看到导入的 UI 设计稿，请严格按照这些设计稿的样式实现：

### 关键设计特征
1. **深色主题** - 背景色：#0A0E17（深黑）
2. **霓虹灯效果** - 使用 box-shadow 发光
3. **玻璃态卡片** - 半透明 + 模糊背景
4. **渐变背景** - 蓝紫色渐变
5. **霓虹色系**：
   - 主色：#00f2ff（霓虹蓝）
   - 辅助色：#bc13fe（霓虹紫）
   - 强调色：#FF00E5（霓虹粉）

### 必须实现的 CSS 效果

```css
/* 玻璃态卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* 霓虹灯发光效果 */
.neon-glow {
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.5);
}

/* 渐变按钮 */
.gradient-button {
  background: linear-gradient(135deg, #00f2ff 0%, #bc13fe 100%);
}
```

### 文字颜色要求（必须保证可读性）
- 主要文字：#ffffff（纯白）
- 次要文字：#e0e0e0（浅灰）
- 绝不使用深灰或中灰色作为文字

---

## 🔗 后端服务连接

### Zeabur 服务 URLs（生产环境）

```bash
VITE_AUTH_SERVICE_URL=https://photo-english-learn-auth-service.zeabur.app
VITE_VISION_SERVICE_URL=https://vision-service.zeabur.app
VITE_WORD_SERVICE_URL=https://word-service.zeabur.app
VITE_PRACTICE_SERVICE_URL=https://practice-service.zeabur.app
VITE_TTS_SERVICE_URL=https://tts-service.zeabur.app
```

### API 调用要求

**重要**：
- ❌ 不允许直接调用 Gemini API
- ✅ 必须调用上述 Zeabur 后端服务
- ✅ 图片必须先上传到图床获取 URL，再传给后端

---

## 💻 技术栈

- React 18 + TypeScript
- Vite 5
- Material-UI v5（必须使用）
- React Router v6
- Axios
- Emotion / styled-components

---

## 📂 项目结构

```
src/
├── api/
│   ├── client.ts              # Axios 客户端
│   ├── services.ts            # API 服务封装
│   └── image-upload.ts        # 图片上传
├── components/
│   ├── common/
│   │   └── ProtectedRoute.tsx
│   └── ui/
│       ├── GlassCard.tsx      # 玻璃态卡片
│       └── GradientButton.tsx  # 渐变按钮
├── contexts/
│   └── AuthContext.tsx
├── pages/
│   ├── Login.tsx              # 登录页
│   ├── Register.tsx           # 注册页
│   ├── Home.tsx                # 首页
│   ├── Camera.tsx              # 相机页
│   ├── Result.tsx              # 识别结果页
│   ├── WordList.tsx            # 生词本
│   └── Practice.tsx            # 练习页
├── theme/
│   └── index.ts               # 赛博朋克主题
├── types/
│   ├── user.ts
│   ├── word.ts
│   └── scene.ts
├── App.tsx
└── main.tsx
```

---

## 🎯 实现步骤

### 步骤 1：创建项目
```bash
npm create vite@latest photo-english-learn-frontend -- --template react-ts
cd photo-english-learn-frontend
npm install react-router-dom axios @mui/material @mui/icons-material @emotion/react @emotion/styled
```

### 步骤 2：配置赛博朋克主题

创建 `src/theme/index.ts`，使用以下配置：

```typescript
import { createTheme } from '@mui/material/styles';

export const cyberpunkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#00f2ff' },
    secondary: { main: '#bc13fe' },
    background: {
      default: '#0A0E17',
      paper: '#121826',
    },
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
        containedPrimary: {
          background: 'linear-gradient(135deg, #00f2ff 0%, #bc13fe 100%)',
          color: '#000',
        },
      },
    },
  },
});
```

### 步骤 3：创建 API 客户端

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

### 步骤 4：参考已导入的 UI 设计稿

请根据 AI Studio 中已导入的 UI 设计稿，实现以下页面：

1. **登录页面** (login_screen)
   - 玻璃态卡片
   - 霓虹边框输入框
   - 渐变按钮

2. **首页** (home_screen)
   - 霓虹欢迎标题
   - 渐变主功能卡片
   - 玻璃态小卡片

3. **相机页面** (camera_screen)
   - 深色背景
   - 霓虹 FAB 按钮
   - 玻璃态底部栏

4. **结果页面** (results_screen)
   - 玻璃态单词卡片
   - 霓虹色头像
   - 渐变按钮

5. **生词本页面** (vocabulary_book)
   - 玻璃态卡片列表
   - 霓虹图标
   - 搜索栏

6. **练习页面** (practice_screen)
   - 玻璃态卡片
   - 渐变进度条

7. **个人中心** (profile_screen)
   - 用户信息卡片
   - 设置列表

### 步骤 5：实现核心功能

每个页面需要实现：

1. **登录/注册**
   - 调用后端 Auth Service API
   - JWT Token 存储

2. **相机**
   - 调用设备相机
   - 选择相册图片
   - 上传图片到图床（ImgBB）
   - 调用后端 Vision Service

3. **识别结果**
   - 显示识别的单词列表
   - 添加单词到生词本
   - 调用后端 Word Service

4. **生词本**
   - 显示已保存的单词
   - 搜索和筛选
   - 调用后端 Word Service

5. **练习**
   - 显示练习内容
   - 调用后端 Practice Service

---

## ✅ 代码要求

### 必须包含的文件

- `package.json` - 包含所有依赖
- `vite.config.ts` - Vite 配置
- `tsconfig.json` - TypeScript 配置
- `index.html` - HTML 入口
- `.env.production` - 生产环境变量
- `.gitignore`
- `netlify.toml` - Netlify 部署配置

### 必须实现的功能

- [ ] 用户认证（注册/登录/登出）
- [ ] 路由守卫（未登录跳转）
- [ ] 相机拍照/上传
- [ ] 图片上传到图床
- [ ] AI 识别（调用后端 Vision Service）
- [ ] 生词本管理（调用后端 Word Service）
- [ ] 单词发音（调用后端 TTS Service）
- [ ] 练习功能

### 必须遵循的设计规范

1. **颜色** - 严格按照设计稿的颜色
2. **字体** - Roboto + Noto Sans SC
3. **间距** - 参考设计稿的间距
4. **圆角** - 16px（卡片）、24px（按钮）
5. **阴影** - 发光效果、玻璃态效果
6. **动画** - 悬停缩放、渐变过渡

---

## 🚀 部署准备

### Netlify 配置

创建 `netlify.toml`：

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

### 环境变量

创建 `.env.production`：

```bash
VITE_AUTH_SERVICE_URL=https://photo-english-learn-auth-service.zeabur.app
VITE_VISION_SERVICE_URL=https://vision-service.zeabur.app
VITE_WORD_SERVICE_URL=https://word-service.zeabur.app
VITE_PRACTICE_SERVICE_URL=https://practice-service.zeabur.app
VITE_TTS_SERVICE_URL=https://tts-service.zeabur.app
IMGBB_API_KEY=your_imgbb_api_key
```

---

## 📋 开发清单

请按照以下顺序完成开发：

### Phase 1: 基础架构
1. 项目初始化和依赖安装
2. 配置 TypeScript 和 Vite
3. 配置 Material-UI 赛博朋克主题
4. 创建 API 客户端和服务
5. 创建类型定义

### Phase 2: 认证系统
6. 创建 AuthContext
7. 实现登录页面（参考 login_screen）
8. 实现注册页面
9. 实现路由守卫

### Phase 3: 核心功能
10. 实现首页（参考 home_screen）
11. 实现相机页面（参考 camera_screen）
12. 实现图片上传功能
13. 实现识别结果页面（参考 results_screen）

### Phase 4: 词汇和练习
14. 实现生词本页面（参考 vocabulary_book）
15. 实现练习页面（参考 practice_screen）
16. 实现个人中心（参考 profile_screen）

### Phase 5: 优化和部署
17. 响应式优化
18. 性能优化
19. 部署到 Netlify
20. 测试所有功能

---

## 🎯 重要提醒

1. **参考 UI 设计稿** - 严格按照导入的设计稿样式实现
2. **连接后端** - 必须调用 Zeabur 后端服务
3. **保证可读性** - 虽然深色主题，文字必须清晰可读
4. **完整实现** - 不要省略任何页面或功能
5. **可部署** - 代码必须能在 Netlify 上正常运行

---

现在请根据 AI Studio 中已导入的 UI 设计稿，完整实现这个前端应用。

请从 Phase 1 开始，逐步完成所有开发任务。
