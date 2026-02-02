# 🔧 Zeabur 强制重新构建指南

## 问题现状

Vision Service 部署失败：
```
/usr/local/bin/python: No module named uvicorn
```

**根本原因**：Zeabur 使用了旧的镜像缓存，没有使用我们修复后的 Dockerfile。

## ✅ 已完成的修复

我们已经推送了以下修复：

1. **Commit 45693ba** - 修复 pip 缓存冲突
2. **Commit 7c11f39** - 添加 Zeabur 配置文件

### 新增的配置文件

```
services/vision-service/.zeabur/config.json
services/auth-service/.zeabur/config.json
services/practice-service/.zeabur/config.json
services/tts-service/.zeabur/config.json
```

每个配置文件内容：
```json
{
  "dockerfile": "Dockerfile",
  "context": "."
}
```

---

## 🚀 立即执行：强制重新构建

### 方法 1：在 Zeabur 控制台重新部署（推荐，最快）

1. **登录 Zeabur 控制台**
   - 访问 https://zeabur.com
   - 登录你的账户

2. **找到 vision-service**
   - 在项目列表中找到 vision-service
   - 点击进入服务详情

3. **停止服务**
   - 点击右上角的"停止"按钮
   - 等待服务完全停止

4. **删除部署（可选，如果重新部署不够）**
   - 在服务设置中找到"删除部署"
   - 这会清除镜像缓存

5. **重新部署**
   - 点击"部署"按钮
   - 或者"推送新代码"后自动触发

6. **监控构建日志**
   - 切换到"日志"标签
   - 查找以下成功标志：
     ```
     ✓ Dependencies installed successfully
     ✓ uvicorn version: 0.32.0
     ✓ fastapi version: 0.115.0
     ✓ YOLO model yolov8n loaded successfully
     ```

### 方法 2：在 Zeabur 控制台配置 Dockerfile 路径

1. **进入 vision-service 设置**
   - 点击服务名称
   - 进入"设置"标签

2. **配置部署方式**
   - 找到"部署方式"或"Build Configuration"
   - 选择 **"Dockerfile"**（不是自动检测）
   - Dockerfile 路径：`services/vision-service/Dockerfile`
   - 上下文路径：`services/vision-service`

3. **保存并重新部署**
   - 点击"保存"
   - 点击"重新部署"

### 方法 3：清除服务并重新创建（终极方案）

如果上述方法都无效：

1. **删除 vision-service**
   - 在 Zeabur 控制台
   - 服务设置 → 删除服务
   - ⚠️ 注意：这会删除服务，但不会删除代码

2. **重新创建服务**
   - 点击"添加新服务"
   - 选择你的 GitHub 仓库
   - 选择 `services/vision-service` 目录
   - 确保"Dockerfile"部署方式被选中
   - Dockerfile 路径：`services/vision-service/Dockerfile`

### 方法 4：触发空提交（用于强制构建）

如果 Zeabur 已经配置正确但需要强制重新构建：

```bash
cd E:\photo-english-learn
git commit --allow-empty -m "chore: trigger vision-service rebuild"
git push
```

---

## 🔍 验证修复效果

### 1. 检查构建日志

在 Zeabur 控制台查看日志，应该看到：

```
Step 6/9 : RUN --mount=type=cache,target=/root/.cache/pip     pip install -r requirements-full.txt ...
 ---> Running in xxx
Collecting fastapi==0.115.0
Collecting uvicorn==0.32.0
...
Successfully installed fastapi-0.115.0 uvicorn-0.32.0 ...
✓ Dependencies installed successfully
✓ uvicorn version: 0.32.0
✓ fastapi version: 0.115.0
```

### 2. 检查镜像大小

- **旧镜像**：~147MB（使用 `uvicorn[standard]`）
- **新镜像**：~140MB（移除了不必要的依赖）

### 3. 检查容器启动日志

容器应该成功启动：

```
INFO:     Started server process [1]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8003
```

**不应该再看到**：
```
/usr/local/bin/python: No module named uvicorn
```

---

## 📋 故障排查清单

### ✅ 已完成的修复

- [x] 修复 Dockerfile（移除 `--no-cache-dir`）
- [x] 优化依赖（移除 `uvicorn[standard]`）
- [x] 添加验证日志
- [x] 创建 `.zeabur/config.json`

### ⏳ 待执行的操作

- [ ] **在 Zeabur 控制台重新部署** ← 立即执行
- [ ] 检查构建日志是否包含验证信息
- [ ] 验证容器成功启动
- [ ] 测试 API 端点是否正常

### 🔧 如果还是失败

#### 检查 1：确认 Dockerfile 路径

在 Zeabur 控制台确认：
- 部署方式：Dockerfile
- Dockerfile 路径：`services/vision-service/Dockerfile`

#### 检查 2：查看完整构建日志

在 Zeabur 控制台：
- 切换到"日志"标签
- 查看最近的构建日志
- 找到失败的具体步骤

#### 检查 3：联系 Zeabur 支持

如果问题持续，提供以下信息：
- Service ID：vision-service
- Environment ID：environment-696b0401a7aaff0c1152e390
- 错误日志：`/usr/local/bin/python: No module named uvicorn`
- 相关 Commit：45693ba, 7c11f39

---

## 📊 预期时间线

| 步骤 | 预计时间 |
|------|---------|
| 停止服务 | 10 秒 |
| 删除部署 | 30 秒 |
| 重新部署 | 5-8 分钟（首次）或 2-3 分钟（缓存） |
| 启动容器 | 30-60 秒 |
| **总计** | **6-10 分钟** |

---

## 💡 为什么需要手动触发？

### Zeabur 的构建机制

1. **自动检测模式**（默认）
   - Zeabur 自动检测项目类型
   - 可能不使用自定义 Dockerfile
   - 使用缓存的旧镜像

2. **自定义 Dockerfile**（推荐）
   - 显式指定 Dockerfile 路径
   - 每次代码变更重新构建
   - 使用最新的依赖和配置

### 我们的配置

通过添加 `.zeabur/config.json`：
```json
{
  "dockerfile": "Dockerfile",
  "context": "."
}
```

我们告诉 Zeabur：
- ✅ 使用 `Dockerfile`（不是自动检测）
- ✅ 构建上下文是当前目录
- ✅ 不要使用缓存的旧镜像

---

## 🎯 下一步

### 立即行动

1. **打开 Zeabur 控制台**
   - https://zeabur.com

2. **找到 vision-service**
   - 在你的项目中

3. **点击"重新部署"按钮**
   - 或者按照"方法 1"的步骤操作

4. **等待构建完成**
   - 5-10 分钟

5. **验证成功**
   - 查看日志
   - 测试 API

### 如果成功

你应该看到：
- ✅ 镜像大小从 147MB 降至 ~140MB
- ✅ 构建日志包含验证信息
- ✅ 容器成功启动
- ✅ API 正常响应

### 如果还是失败

请提供：
1. 完整的构建日志（特别是失败的部分）
2. Zeabur 控制台的截图
3. 服务的部署配置截图

我会进一步帮你诊断！

---

## 📞 需要帮助？

如果在执行过程中遇到问题：

1. **截图当前状态**
   - Zeabur 控制台的 vision-service 页面
   - 设置/部署配置页面
   - 构建日志

2. **描述你尝试的方法**
   - 方法 1：重新部署
   - 方法 2：配置 Dockerfile 路径
   - 方法 3：删除并重建

3. **提供错误信息**
   - 完整的错误日志
   - 失败的步骤

我会根据具体情况提供更详细的指导！🚀
