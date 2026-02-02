# 前端部署指南

## 📦 部署到 Zeabur

### 前置条件

- ✅ 后端服务已部署到 Zeabur
- ✅ Git 仓库已推送到 GitHub/GitLab
- ✅ Zeabur 账户已登录

### 部署步骤

#### 1. 提交代码到 Git

```bash
cd E:\photo-english-learn-Frontend
git add .
git commit -m "feat: add production deployment configuration

- Add Dockerfile for multi-stage build
- Add nginx configuration for SPA routing
- Add .dockerignore to exclude unnecessary files
- Add .zeabur/config.json for deployment"
git push
```

#### 2. 在 Zeabur 创建新服务

1. 登录 [Zeabur 控制台](https://zeabur.com)
2. 进入您的项目
3. 点击"创建新服务"或"Add Service"
4. 选择 **Git** → 选择您的 Git 仓库
5. 选择 `photo-english-learn-Frontend` 目录（如果仓库包含多个项目）
6. 点击"部署"

#### 3. 配置服务

Zeabur 会自动检测 Dockerfile 并开始构建：

- **构建时间**: 约 2-3 分钟
- **镜像大小**: ~50-80 MB（基于 nginx:alpine）
- **端口**: 80（nginx）

#### 4. 获取部署 URL

部署完成后，Zeabur 会自动分配一个 URL：
- 格式：`https://xxx.zeabur.app`
- 这是您的前端访问地址

#### 5. 配置自定义域名（可选）

如果您有自己的域名：

1. 在 Zeabur 服务设置中点击"域名"
2. 添加自定义域名
3. 配置 DNS 记录（CNAME）
4. 等待 SSL 证书自动生成

## 🔧 配置说明

### API 地址

当前 API 地址已配置为生产环境：
```
https://photo-english-learn-api-gateway.zeabur.app
```

如果需要更改，请编辑 `src/lib/api.ts`:
```typescript
const API_BASE_URL = 'https://your-api-gateway-url.zeabur.app';
```

### 环境变量（可选）

如果需要使用环境变量配置 API：

1. 在 Zeabur 控制台添加环境变量：
   - `VITE_API_BASE_URL`: API Gateway 地址

2. 修改 `src/lib/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://photo-english-learn-api-gateway.zeabur.app';
```

## 📊 构建产物

构建后的文件包含：
- **HTML**: 入口页面
- **JavaScript**: 打包后的 JS 文件（已压缩）
- **CSS**: 打包后的样式文件（Tailwind CSS）
- **静态资源**: 图片、字体等

## 🔍 验证部署

部署完成后：

1. 访问 Zeabur 分配的 URL
2. 检查以下功能：
   - ✅ 页面正常加载
   - ✅ 路由切换正常
   - ✅ API 调用成功
   - ✅ 图片上传功能正常
   - ✅ 登录/注册功能正常

## 🐛 故障排查

### 问题 1: 页面 404

**原因**: nginx 配置问题，SPA 路由未正确配置

**解决**: 检查 `nginx.conf` 中的 `try_files` 配置

### 问题 2: API 调用失败

**原因**: API 地址错误或 CORS 问题

**解决**:
1. 检查 `src/lib/api.ts` 中的 API_BASE_URL
2. 检查 API Gateway 的 CORS 配置
3. 查看 Zeabur 日志

### 问题 3: 构建失败

**原因**: 依赖安装失败或构建错误

**解决**:
1. 检查 `package.json` 和 `package-lock.json`
2. 查看 Zeabur 构建日志
3. 确保所有依赖都正确安装

### 问题 4: 样式丢失

**原因**: Tailwind CSS v4 配置问题

**解决**: 确保 `@tailwindcss/vite` 插件正确配置

## 📚 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **样式**: Tailwind CSS v4
- **路由**: React Router v7
- **服务器**: nginx (Alpine)
- **部署**: Zeabur

## 🚀 本地构建测试

在部署前，可以本地测试构建：

```bash
# 构建生产版本
npm run build

# 预览构建产物
npm run preview

# 或使用 nginx 本地测试
docker build -t frontend .
docker run -p 8080:80 frontend
```

访问 `http://localhost:8080` 查看效果。
