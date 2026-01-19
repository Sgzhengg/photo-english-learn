# Zeabur 服务 URLs 配置文档

## 🌐 服务公网地址

### 认证服务 (Auth Service)
- **服务名称**: Auth Service
- **公网 URL**: `https://photo-english-learn-auth-service.zeabur.app`
- **API 文档**: `https://photo-english-learn-auth-service.zeabur.app/docs`
- **OpenAPI 规范**: `https://photo-english-learn-auth-service.zeabur.app/openapi.json`
- **端口**: 8001

### 视觉服务 (Vision Service)
- **服务名称**: Vision Service
- **公网 URL**: `https://vision-service.zeabur.app`
- **API 文档**: `https://vision-service.zeabur.app/docs`
- **OpenAPI 规范**: `https://vision-service.zeabur.app/openapi.json`
- **端口**: 8003

### 词汇服务 (Word Service)
- **服务名称**: Word Service
- **公网 URL**: `https://word-service.zeabur.app`
- **API 文档**: `https://word-service.zeabur.app/docs`
- **OpenAPI 规范**: `https://word-service.zeabur.app/openapi.json`
- **端口**: 8004

### 练习服务 (Practice Service)
- **服务名称**: Practice Service
- **公网 URL**: `https://practice-service.zeabur.app`
- **API 文档**: `https://practice-service.zeabur.app/docs`
- **OpenAPI 规范**: `https://practice-service.zeabur.app/openapi.json`
- **端口**: 8005

### 语音服务 (TTS Service)
- **服务名称**: TTS Service
- **公网 URL**: `https://tts-service.zeabur.app`
- **API 文档**: `https://tts-service.zeabur.app/docs`
- **OpenAPI 规范**: `https://tts-service.zeabur.app/openapi.json`
- **端口**: 8006

## 🔧 前端环境变量配置

### 开发环境 (.env.development)

```bash
# 如果需要本地测试后端，使用这些地址（需要端口转发或 VPN）
VITE_AUTH_SERVICE_URL=http://localhost:8001
VITE_VISION_SERVICE_URL=http://localhost:8003
VITE_WORD_SERVICE_URL=http://localhost:8004
VITE_PRACTICE_SERVICE_URL=http://localhost:8005
VITE_TTS_SERVICE_URL=http://localhost:8006
```

### 生产环境 (.env.production)

```bash
# Zeabur 部署的生产环境 URL
VITE_AUTH_SERVICE_URL=https://photo-english-learn-auth-service.zeabur.app
VITE_VISION_SERVICE_URL=https://vision-service.zeabur.app
VITE_WORD_SERVICE_URL=https://word-service.zeabur.app
VITE_PRACTICE_SERVICE_URL=https://practice-service.zeabur.app
VITE_TTS_SERVICE_URL=https://tts-service.zeabur.app
```

## 📋 快速测试命令

### 健康检查

```bash
# Auth Service
curl https://photo-english-learn-auth-service.zeabur.app/

# Vision Service
curl https://vision-service.zeabur.app/

# Word Service
curl https://word-service.zeabur.app/

# Practice Service
curl https://practice-service.zeabur.app/

# TTS Service
curl https://tts-service.zeabur.app/
```

### API 功能测试

```bash
# 1. 测试用户注册
curl -X POST https://photo-english-learn-auth-service.zeabur.app/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# 2. 测试用户登录
curl -X POST https://photo-english-learn-auth-service.zeabur.app/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
# 保存返回的 access_token

# 3. 测试单词查询（无需认证）
curl https://word-service.zeabur.app/lookup/apple

# 4. 测试获取用户信息（需要 token）
curl https://photo-english-learn-auth-service.zeabur.app/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 5. 测试生词列表（需要 token）
curl https://word-service.zeabur.app/list \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# 6. 测试搜索单词
curl https://word-service.zeabur.app/search/apple
```

## 🎯 前端 API 客户端配置

### TypeScript 配置示例

```typescript
// frontend/src/config/api.ts
export const API_BASE_URLS = {
  auth: import.meta.env.VITE_AUTH_SERVICE_URL || 'https://photo-english-learn-auth-service.zeabur.app',
  vision: import.meta.env.VITE_VISION_SERVICE_URL || 'https://vision-service.zeabur.app',
  word: import.meta.env.VITE_WORD_SERVICE_URL || 'https://word-service.zeabur.app',
  practice: import.meta.env.VITE_PRACTICE_SERVICE_URL || 'https://practice-service.zeabur.app',
  tts: import.meta.env.VITE_TTS_SERVICE_URL || 'https://tts-service.zeabur.app',
}
```

### Axios 实例配置

```typescript
// frontend/src/api/client.ts
import axios from 'axios'
import { API_BASE_URLS } from './config'

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
    }
  )

  // 响应拦截器
  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
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
  auth: createApiClient(API_BASE_URLS.auth),
  vision: createApiClient(API_BASE_URLS.vision),
  word: createApiClient(API_BASE_URLS.word),
  practice: createApiClient(API_BASE_URLS.practice),
  tts: createApiClient(API_BASE_URLS.tts),
}
```

## 🔒 CORS 配置更新

### 需要更新后端 CORS 的时机

当您的前端部署到 Netlify 后，会获得一个域名，例如：
```
https://your-frontend-name.netlify.app
```

此时需要更新所有后端服务的 CORS 配置：

```python
# services/*/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-name.netlify.app",  # 替换为实际域名
        "http://localhost:5173",  # 本地开发
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 本地开发时的临时解决方案

在前端开发初期，可以先使用通配符（**不推荐用于生产环境**）：

```python
allow_origins=["*"]  # 允许所有域名（仅开发阶段）
```

## 📊 服务状态监控

### 手动检查服务状态

```bash
# 检查所有服务是否在线
services=(
  "photo-english-learn-auth-service.zeabur.app"
  "vision-service.zeabur.app"
  "word-service.zeabur.app"
  "practice-service.zeabur.app"
  "tts-service.zeabur.app"
)

for service in "${services[@]}"; do
  echo "Testing: https://$service"
  curl -s "https://$service" | jq '.data.service'
  echo "---"
done
```

### 使用浏览器监控

直接访问 API 文档页面，每个服务的 Swagger UI 会显示：
- 所有可用的端点
- 请求/响应格式
- 在线测试功能

## 🚀 Netlify 部署后的步骤

1. **部署前端到 Netlify**
   - 获得 Netlify 域名：`https://your-app.netlify.app`

2. **更新 Zeabur 后端 CORS**
   - 在每个服务的 `main.py` 中添加 Netlify 域名到 `allow_origins`
   - 提交代码并重新部署

3. **测试跨域请求**
   ```javascript
   // 在浏览器控制台测试
   fetch('https://photo-english-learn-auth-service.zeabur.app/')
     .then(r => r.json())
     .then(data => console.log(data))
   ```

4. **验证 API 调用**
   - 打开前端应用
   - 测试登录功能
   - 测试 API 调用是否正常

## 📝 相关文件

将这些 URLs 添加到以下文件：

1. **前端项目** `frontend/.env.production`
2. **前端 API 客户端** `frontend/src/config/api.ts`
3. **README 文档** 作为部署说明

## ✅ 验证清单

在开始前端开发前，请确认：

- [ ] 所有 5 个服务的健康检查端点都能访问
- [ ] 能够访问每个服务的 API 文档 (`/docs`)
- [ ] 测试过用户注册和登录功能
- [ ] 记录了所有服务的 URL 供前端配置使用
- [ ] 了解需要在部署前端后更新 CORS 配置

## 🎉 准备完成！

所有后端服务的 URL 已确认，现在可以开始前端开发了！

按照 [FRONTEND_SETUP_CHECKLIST.md](FRONTEND_SETUP_CHECKLIST.md) 中的步骤：
1. 初始化前端项目
2. 配置环境变量（使用这些 URLs）
3. 创建 API 客户端
4. 开始开发 UI

祝您的前端开发顺利！🚀
