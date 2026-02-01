# Zeabur 配置说明

## 强制使用自定义 Dockerfile

为了让 Zeabur 使用自定义 Dockerfile 而不是自动检测，需要：

1. **创建 `.zeabur/config.json`** ✅ (已完成)
   ```json
   {
     "dockerfile": "Dockerfile",
     "context": "."
   }
   ```

2. **或者**在 Zeabur 控制台手动配置：
   - 进入 vision-service 设置
   - 部署方式 → 选择 "Dockerfile"
   - 路径：`services/vision-service/Dockerfile`

## 清除缓存和重新构建

如果 Zeabur 还在使用旧镜像：

1. **触发重新部署**：
   - 在 Zeabur 控制台，点击 vision-service 的"重新部署"按钮
   - 或者做一个小的代码更改并推送

2. **清除构建缓存**（如果支持）：
   - 在 Zeabur 控制台找到"清除缓存"选项
   - 或者删除服务后重新创建

3. **强制重新构建**：
   ```bash
   # 在服务目录创建一个空提交
   git commit --allow-empty -m "chore: trigger rebuild"
   git push
   ```

## 验证 Dockerfile 是否被使用

重新部署后，查看构建日志：

**应该看到**：
```
✓ Dependencies installed successfully
✓ uvicorn version: 0.32.0
✓ fastapi version: 0.115.0
```

**镜像大小应该变小**：
- 旧镜像：~147MB（使用 uvicorn[standard]）
- 新镜像：~140MB（移除了不必要的依赖）

## 如果还是失败

如果 Zeabur 仍然使用自动检测，可以尝试：

1. **重命名 Dockerfile**（临时方案）：
   ```bash
   mv Dockerfile Dockerfile.zeabur
   ```

2. **使用完整路径**：
   在 Zeabur 配置中指定：`services/vision-service/Dockerfile`

3. **联系 Zeabur 支持**：
   提供这个 `.zeabur/config.json` 配置作为参考
