# Vision Service 部署修复 - uvicorn 错误

## 问题

Vision Service 在 Zeabur 上部署时崩溃：

```
/usr/local/bin/python: No module named uvicorn
```

## 根本原因

1. **依赖安装失败**：Dockerfile 使用了条件语句安装分层 requirements 文件
2. **if 条件问题**：Shell 的 if 语句在 Docker RUN 中可能没有正确执行
3. **文件顺序**：uvicorn 在 `requirements-base.txt` 中，但没有被正确安装

## 修复方案

### 创建完整的依赖文件

创建了 `requirements-full.txt`，包含**所有**依赖：
- FastAPI 和 uvicorn
- 数据库相关
- ML 和图像处理
- 所有其他依赖

### 更新 Dockerfile

```dockerfile
# 优先使用完整依赖文件
RUN if [ -f requirements-full.txt ]; then \
      echo "Installing from requirements-full.txt..."; \
      pip install --no-cache-dir -r requirements-full.txt; \
    else \
      echo "Installing from layered requirements..."; \
      pip install --no-cache-dir -r requirements-base.txt && \
      pip install --no-cache-dir -r requirements-ml.txt && \
      pip install --no-cache-dir -r requirements.txt; \
    fi
```

**优势**：
- ✅ 单个文件安装，更可靠
- ✅ 不依赖条件语句的多个阶段
- ✅ 有回退方案（如果 full 不存在）

## 文件变更

### 新增文件
- `services/vision-service/requirements-full.txt` - 完整依赖列表

### 修改文件
- `services/vision-service/Dockerfile` - 优先使用 requirements-full.txt

## 部署说明

### Zeabur 配置

确保 Zeabur 使用自定义 Dockerfile：

1. 登录 Zeabur 控制台
2. 选择 `vision-service`
3. 设置 → 部署方式 → 选择 **Dockerfile**
4. Dockerfile 路径：`services/vision-service/Dockerfile`

### 验证部署

部署成功后，应该看到：

```
✓ Installing from requirements-full.txt...
✓ Successfully installed fastapi-0.115.0 uvicorn-0.32.0 ...
✓ YOLO model yolov8n loaded successfully
✓ Application startup complete
```

### 检查日志

在 Zeabur 控制台查看日志，确认：
- ✅ 不再有 "No module named uvicorn" 错误
- ✅ 依赖安装成功
- ✅ 服务正常启动

## 依赖文件对比

### requirements-full.txt（推荐）
```
✅ 单文件，包含所有依赖
✅ 安装简单，不会遗漏
✅ 适合 Zeabur 等平台的快速部署
```

### 分层 requirements（可选保留）
```
- requirements-base.txt（基础依赖）
- requirements-ml.txt（ML 依赖）
- requirements.txt（应用依赖）

⚠️ 更复杂的安装逻辑
⚠️ 可能因为条件语句失败
```

## 预期效果

修复后：
- ✅ 依赖正确安装
- ✅ uvicorn 可用
- ✅ 服务正常启动
- ✅ 部署时间：约 5-8 分钟（首次），2-3 分钟（后续）

## 下一步

如果部署仍然失败：

1. **检查 Zeabur 日志**：
   - 查看完整的构建日志
   - 确认哪个步骤失败

2. **验证 Dockerfile 路径**：
   - 确保使用 `services/vision-service/Dockerfile`
   - 不是自动检测（可能使用错误的配置）

3. **本地测试**：
   ```bash
   cd services/vision-service
   docker build -t vision-service-test .
   docker run -p 8003:8003 vision-service-test
   ```

4. **简化方案**：
   如果仍有问题，可以删除分层 requirements 文件，只保留 requirements-full.txt

## Commit 信息

**Commit**: `9ac47db`
**消息**: `fix: resolve uvicorn import error in vision-service deployment`
