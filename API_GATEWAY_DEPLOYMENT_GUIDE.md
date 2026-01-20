# API网关部署指南 - 完整解决方案

## 🎯 问题分析

### 当前问题
1. ❌ **CORS错误** - 虽然后端已配置CORS，但注册仍失败
2. ❌ **500错误** - 后端服务内部错误（可能是数据库未连接）
3. ❌ **架构复杂** - 前端需要配置5个不同的服务URL
4. ❌ **难以调试** - 分散的服务难以统一监控和调试

### 根本原因
测试发现注册端点返回 `Internal Server Error`，这**不是CORS问题**，而是：
- 数据库未连接
- 数据库表未创建
- 环境变量未配置

---

## ✅ 解决方案：API网关架构

### 新架构优势

```
┌─────────┐
│ 前端    │
│(React)  │
└────┬────┘
     │
     │ 只需配置一个URL
     │
     ▼
┌─────────────┐
│ API网关     │  ← 统一入口
│ (Gateway)   │
└────┬────────┘
     │
     ├─→ auth-service (注册/登录)
     ├─→ vision-service (图像识别)
     ├─→ word-service (单词管理)
     ├─→ practice-service (练习)
     └─→ tts-service (语音合成)
```

**好处**:
1. ✅ 前端只需配置1个URL
2. ✅ 统一的CORS配置
3. ✅ 统一的错误处理
4. ✅ 统一的日志和监控
5. ✅ 可以添加限流、缓存等
6. ✅ 容易调试

---

## 📝 实施步骤

### 步骤1: API网关已创建 ✅

已创建的文件：
- `services/api-gateway/main.py` - 网关主程序
- `services/api-gateway/requirements.txt` - Python依赖
- `api-gateway.Dockerfile` - Docker配置

已推送到GitHub: `commit 7490649`

---

### 步骤2: 在Zeabur部署API网关 ⏳

#### 2.1 登录Zeabur
访问: https://zeabur.com

#### 2.2 创建新服务
1. 选择您的项目
2. 点击 "Create Service" 或 "New Service"
3. 选择 "Git"
4. 选择您的仓库: `Sgzhengg/photo-english-learn`
5. 选择分支: `main`
6. Dockerfile路径: `api-gateway.Dockerfile` (根目录)
7. 服务名称: `photo-english-learn-api-gateway` (会自动生成域名)

#### 2.3 配置环境变量（可选）
如果需要自定义后端服务URL，添加：
```
AUTH_SERVICE_URL=https://photo-english-learn-auth-service.zeabur.app
VISION_SERVICE_URL=https://vision-service.zeabur.app
WORD_SERVICE_URL=https://word-service.zeabur.app
PRACTICE_SERVICE_URL=https://practice-service.zeabur.app
TTS_SERVICE_URL=https://tts-service.zeabur.app
```

#### 2.4 部署
点击 "Deploy" 按钮，等待部署完成（约1-2分钟）

#### 2.5 获取网关URL
部署完成后，Zeabur会显示类似：
```
https://photo-english-learn-api-gateway.zeabur.app
```

---

### 步骤3: 更新前端配置 📝

#### 3.1 替换 API 配置文件

**文件**: `C:\Users\ASUS\OneDrive\Desktop\photo-english-learn\services\api.ts`

**完整替换为以下内容**:

```typescript
import axios from 'axios';

// ⭐ API网关统一入口
const API_GATEWAY_URL = 'https://photo-english-learn-api-gateway.zeabur.app';

// 如果API网关还未部署，可临时使用直连模式
const USE_DIRECT_MODE = false;  // 改为 true 可切换回直连模式

// 直连模式的URLs（备用）
const DIRECT_URLS = {
  auth: 'https://photo-english-learn-auth-service.zeabur.app',
  vision: 'https://vision-service.zeabur.app',
  word: 'https://word-service.zeabur.app',
  practice: 'https://practice-service.zeabur.app',
  tts: 'https://tts-service.zeabur.app',
};

const createClient = (service?: string) => {
  // 使用API网关模式
  const baseURL = USE_DIRECT_MODE && service
    ? DIRECT_URLS[service as keyof typeof DIRECT_URLS]
    : API_GATEWAY_URL;

  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器
  client.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');

      if (token &&
          typeof token === 'string' &&
          token.length > 20 &&
          token !== 'undefined' &&
          token !== 'null') {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (config.method === 'get') {
        delete config.headers['Content-Type'];
      }

      console.debug(`[API] ${config.method?.toUpperCase()} -> ${baseURL}${config.url}`);
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 响应拦截器
  client.interceptors.response.use(
    (response) => {
      const resData = response.data;
      if (resData && typeof resData === 'object' && 'code' in resData) {
        if (resData.code === 0 || resData.code === 200 || resData.code === 201) {
          return { ...response, data: resData.data || resData };
        }
      }
      return response;
    },
    (error) => {
      const { response } = error;

      if (!response) {
        error.isNetworkError = true;
        error.customMessage = '无法连接到API网关。\n\n请确认：\n1. API网关服务已部署到Zeabur\n2. 网络连接正常\n3. 检查浏览器控制台Network标签';
      } else if (response.status === 401) {
        localStorage.removeItem('access_token');
      } else if (response.status >= 500) {
        error.isServerError = true;
        error.customMessage = `服务器错误 (${response.status})，请稍后重试`;
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// ⭐ 导出统一的API客户端
export const api = createClient();

// 为了兼容，也导出各个服务的API（但它们都指向网关）
export const authApi = createClient('auth');
export const visionApi = createClient('vision');
export const wordApi = createClient('word');
export const practiceApi = createClient('practice');
export const ttsApi = createClient('tts');

// 用于第三方API的干净实例
export const cleanApi = axios.create({ timeout: 60000 });

// 环境变量
export const imgBBApiKey = (import.meta as any).env?.IMGBB_API_KEY || '';
```

#### 3.2 更新所有页面的API导入

**需要更新的文件**:
- `pages/RegisterPage.tsx`
- `pages/LoginPage.tsx`
- `pages/HomePage.tsx`
- `pages/CameraPage.tsx`
- `pages/WordListPage.tsx`
- `pages/PracticePage.tsx`
- `pages/ProfilePage.tsx`
- `pages/ResultPage.tsx`

**批量替换方法**:

**之前**:
```typescript
import { authApi } from '../services/api';
import { visionApi } from '../services/api';
// ... 等等

// 使用时:
await authApi.post('/register', data);
await visionApi.post('/analyze', formData);
```

**现在**（统一使用 `api`）:
```typescript
import { api } from '../services/api';

// 所有调用都使用 api:
await api.post('/register', data);
await api.post('/analyze', formData);
await api.get('/words/list');
```

---

### 步骤4: 测试API网关 🧪

#### 4.1 测试网关健康状态
```bash
curl https://photo-english-learn-api-gateway.zeabur.app/
```

**期望返回**:
```json
{
  "code": 0,
  "message": "API Gateway is running",
  "data": {
    "service": "api-gateway",
    "services": ["auth", "vision", "word", "practice", "tts"],
    "status": "healthy"
  }
}
```

#### 4.2 检查所有后端服务状态
```bash
curl https://photo-english-learn-api-gateway.zeabur.app/health
```

#### 4.3 测试注册功能
```bash
curl -X POST https://photo-english-learn-api-gateway.zeabur.app/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"test123456"}'
```

---

## 🔍 当前问题的诊断

### 注册返回500错误的原因

测试发现：
```bash
curl -X POST https://photo-english-learn-auth-service.zeabur.app/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test999","email":"test999@example.com","password":"test123456"}'
# 返回: Internal Server Error
```

**可能原因**:
1. ⚠️ **数据库未连接** - Zeabur的PostgreSQL服务未启动或配置错误
2. ⚠️ **数据库表未创建** - 没有运行数据库迁移
3. ⚠️ **环境变量未配置** - `DATABASE_URL` 等环境变量未设置

### 诊断步骤

#### 1. 检查Zeabur环境变量

在Zeabur控制台中，检查 `auth-service` 的环境变量：
```
DATABASE_URL=postgresql+asyncpg://user:pass@host:port/dbname
JWT_SECRET=your-secret-key
```

#### 2. 检查数据库连接

在Zeabur中：
- 确认PostgreSQL服务正在运行
- 查看数据库日志
- 确认数据库URL正确

#### 3. 创建数据库表

如果数据库已连接但表不存在，需要运行迁移：

```bash
# 本地运行（如果有数据库访问权限）
cd shared
alembic upgrade head

# 或在Zeabur中配置自动迁移
```

#### 4. 查看服务日志

在Zeabur控制台中：
- 点击 `auth-service`
- 查看 "Logs" 标签
- 搜索错误信息

---

## 🚀 完整部署检查清单

### Zeabur部署检查

- [ ] **API网关服务**
  - [ ] 已部署到Zeabur
  - [ ] 健康检查通过 (`/` 返回200)
  - [ ] 后端服务健康检查通过 (`/health`)
  - [ ] 记录网关URL

- [ ] **后端服务（5个）**
  - [ ] auth-service 正在运行
  - [ ] vision-service 正在运行
  - [ ] word-service 正在运行
  - [ ] practice-service 正在运行
  - [ ] tts-service 正在运行

- [ ] **数据库**
  - [ ] PostgreSQL 正在运行
  - [ ] 环境变量已配置 (`DATABASE_URL`)
  - [ ] 数据库表已创建
  - [ ] 可以成功连接

### 前端配置检查

- [ ] **API配置**
  - [ ] `services/api.ts` 已更新为使用API网关
  - [ ] 所有页面的API导入已更新
  - [ ] 环境变量已配置

- [ ] **本地测试**
  - [ ] 前端服务器正在运行 (`npm run dev`)
  - [ ] 浏览器控制台没有CORS错误
  - [ ] 可以成功注册用户

---

## 💡 临时解决方案（如果数据库有问题）

如果后端数据库暂时无法配置，可以使用**Mock模式**进行前端开发：

### 修改API客户端添加Mock模式

```typescript
// 在 services/api.ts 中添加
const USE_MOCK_MODE = true;  // 临时启用Mock

if (USE_MOCK_MODE) {
  // 返回模拟数据
  console.log('[Mock Mode] 模拟API响应');

  return {
    post: async (url: string, data: any) => {
      await new Promise(r => setTimeout(r, 500));
      if (url === '/register') {
        return {
          data: {
            access_token: 'mock_token_' + Date.now(),
            user: { username: data.username, email: data.email }
          }
        };
      }
      return { data: {} };
    },
    get: async () => ({ data: [] }),
  };
}
```

这样可以在没有后端的情况下继续前端开发。

---

## 📞 需要帮助？

### 1. 查看实时日志
在Zeabur控制台查看每个服务的日志

### 2. 测试API网关
访问: `https://photo-english-learn-api-gateway.zeabur.app/health`

### 3. 检查CORS
打开浏览器开发者工具（F12）:
- Network 标签查看请求
- Console 标签查看错误

### 4. 提供错误信息
如果仍有问题，请提供：
- API网关的 `/health` 响应
- 浏览器控制台的完整错误
- Network 标签中失败请求的详情

---

## ✨ 总结

### 架构改进
- **之前**: 5个服务URL → 复杂、难维护
- **现在**: 1个API网关URL → 简单、易维护

### 下一步行动
1. ⏳ 在Zeabur部署API网关（参考步骤2）
2. 📝 更新前端API配置（参考步骤3）
3. 🧪 测试所有功能
4. 🔍 解决后端数据库问题（如果有500错误）

### 预期结果
- ✅ 前端只需配置1个URL
- ✅ 没有CORS问题
- ✅ 统一的错误处理
- ✅ 更容易调试和监控

祝部署顺利！🚀
