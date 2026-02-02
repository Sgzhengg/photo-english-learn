# Zeabur 开发模式部署指南

本文档说明如何在 Zeabur 上配置开发模式（SKIP_AUTH）。

---

## 📋 概述

在 Zeabur 上启用 `SKIP_AUTH=true` 后，所有后端服务将跳过 JWT 认证，使用虚拟用户（user_id=999999）进行操作。

---

## 🔧 配置步骤

### 步骤 1: 准备后端代码

确保已将 `shared/utils/auth.py` 的修改推送到 Git 仓库：

```bash
cd E:\photo-english-learn
git add shared/utils/auth.py
git commit -m "feat: add SKIP_AUTH support for development mode"
git push
```

### 步骤 2: 在 Zeabur 设置环境变量

对于每个需要跳过认证的服务，执行以下操作：

#### 需要配置的服务

- ✅ **auth-service**（如果它也使用了 `get_current_user`）
- ✅ **word-service**
- ✅ **practice-service**
- ⚠️ 检查其他服务是否也使用了 `shared/utils/auth.py`

#### 配置方法

1. 登录 [Zeabur Console](https://zeabur.com/console)
2. 选择你的项目
3. 对每个服务执行以下步骤：

   **方法 A: 通过 UI 配置**
   - 点击服务名称进入服务详情
   - 点击 "Variables" 或 "环境变量" 标签
   - 添加新环境变量：
     - **Name**: `SKIP_AUTH`
     - **Value**: `true`
   - 点击保存

   **方法 B: 通过配置文件**
   - 在服务的配置文件中添加：
     ```yaml
   env:
     - name: SKIP_AUTH
       value: "true"
     ```

### 步骤 3: 重新部署服务

配置环境变量后，需要重新部署服务：

#### 通过 UI 重新部署
- 点击服务右上角的 "Redeploy" 或 "重新部署" 按钮
- 等待部署完成

#### 通过 CLI 重新部署（如果使用 Zeabur CLI）
```bash
zeabur restart [service-name]
```

### 步骤 4: 验证配置

部署完成后，检查服务日志：

```bash
# 在 Zeabur Console 查看日志
# 服务应该成功启动，没有认证相关错误
```

---

## ✅ 测试验证

### 1. 前端测试

前端已经配置好跳过认证，直接访问应用：

```
https://your-frontend-url.zeabur.app
```

应该自动跳转到拍照页面，无需登录。

### 2. 后端测试

使用 curl 测试 API（无需 token）：

```bash
# 测试生词库 API
curl -X GET https://photo-english-learn-api-gateway.zeabur.app/word/list

# 测试练习 API
curl -X GET https://photo-english-learn-api-gateway.zeabur.app/practice/review
```

应该返回数据（可能是空列表，但不应该返回 401 错误）。

---

## 🎯 关键注意事项

### 1. 代码依赖关系

由于 `shared/utils/auth.py` 是共享代码模块：

- ✅ 优点：修改一处，所有使用该模块的服务自动生效
- ⚠️ 注意：需要重新部署所有使用该模块的服务

### 2. 环境变量传播

Zeabur 会将环境变量注入到容器的运行时环境中：

- Python 代码通过 `os.getenv("SKIP_AUTH", "false")` 读取
- 确保变量名拼写正确（大小写敏感）
- 值为字符串 `"true"`（不是布尔值）

### 3. 数据库影响

启用开发模式后：

- 虚拟用户（user_id=999999）的数据会正常保存到数据库
- 测试数据会持久化，重启后仍然存在
- 多次部署会累积测试数据

---

## 🧹 清理测试数据

如果需要清空虚拟用户的测试数据：

### 方法 1: 通过数据库客户端

```sql
-- 连接到你的 PostgreSQL 数据库
-- 删除虚拟用户的所有相关数据

DELETE FROM review_records WHERE user_id = 999999;
DELETE FROM user_words WHERE user_id = 999999;
DELETE FROM scene_sentences WHERE scene_id IN (
    SELECT scene_id FROM scenes WHERE user_id = 999999
);
DELETE FROM detected_objects WHERE scene_id IN (
    SELECT scene_id FROM scenes WHERE user_id = 999999
);
DELETE FROM scenes WHERE user_id = 999999;
DELETE FROM users WHERE user_id = 999999;
```

### 方法 2: 重置数据库（慎用）

⚠️ **警告**：这会删除所有数据，包括生产数据！

```bash
# 仅在开发/测试环境使用
# 在 Zeabur Console 中选择数据库服务
# 点击 "Reset" 或 "重置" 按钮
```

---

## 🔄 切换回生产模式

### 前端恢复

参考 `DEV_MODE_NOTES.md` 中的说明，恢复前端认证检查。

### 后端恢复

**方法 1**: 删除环境变量
- 在 Zeabur Console 中删除 `SKIP_AUTH` 环境变量
- 重新部署所有服务

**方法 2**: 修改环境变量值
- 将 `SKIP_AUTH` 的值改为 `false`
- 重新部署所有服务

---

## 📊 服务列表检查

使用以下命令检查哪些服务需要配置 `SKIP_AUTH`：

```bash
# 在后端项目根目录
cd E:\photo-english-learn

# 搜索使用 get_current_user 的服务
grep -r "from shared.utils.auth import get_current_user" services/
```

预期输出：
```
services/word-service/main.py: from shared.utils.auth import get_current_user, get_current_user_optional
services/practice-service/main.py: from shared.utils.auth import get_current_user, get_current_user_optional
services/auth-service/main.py: from shared.utils.auth import ...
```

---

## 🚀 快速部署脚本（可选）

如果你使用 Zeabur CLI 或自动化部署，可以创建脚本：

```bash
#!/bin/bash
# deploy-dev-mode.sh

SERVICES=("word-service" "practice-service" "auth-service")

echo "🚀 开始部署开发模式配置..."

for service in "${SERVICES[@]}"; do
    echo "📦 配置服务: $service"
    # 这里需要根据你的部署工具填写具体命令
    # 例如: zeabur env set SKIP_AUTH=true --service $service
    # zeabur restart $service
done

echo "✅ 部署完成！"
```

---

## ❓ 常见问题

### Q1: 配置后仍然返回 401 错误？

**A**: 检查以下几点：
1. 确认环境变量 `SKIP_AUTH=true` 已正确设置
2. 确认服务已重新部署
3. 检查服务日志，确认 Python 代码读取到了环境变量
4. 确认 `shared/utils/auth.py` 的修改已推送到 Git

### Q2: 部署失败怎么办？

**A**:
1. 检查 Zeabur 的构建日志
2. 确认 Git 仓库中 `shared/utils/auth.py` 已正确修改
3. 尝试手动触发重新部署

### Q3: 可以只在某些服务上启用吗？

**A**: 可以。根据你的需求，只为特定的服务设置 `SKIP_AUTH=true`。但建议保持一致，避免认证状态混乱。

---

## 📚 相关文档

- [DEV_MODE_NOTES.md](./DEV_MODE_NOTES.md) - 开发模式完整说明
- [Zeabur 官方文档 - 环境变量](https://zeabur.com/docs/docs/environment-variables)

---

**最后更新**: 2025-02-01
**适用版本**: v1.0.0+
