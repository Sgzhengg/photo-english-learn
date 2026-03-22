# 匿名登录功能 - 部署指南

## ⚠️ 重要：数据库迁移

部署到Zeabur后，**必须执行数据库迁移**，否则匿名登录功能无法工作（会返回500错误）。

### 方法1：通过Zeabur控制台执行（推荐）

1. 登录Zeabur控制台
2. 进入你的项目
3. 找到PostgreSQL服务
4. 点击"Console"或"终端"按钮
5. 执行以下SQL命令：

```sql
-- 检查当前表结构
SHOW COLUMNS FROM users;

-- 添加device_id列（如果不存在）
ALTER TABLE users ADD COLUMN device_id VARCHAR(255) UNIQUE DEFAULT NULL;
CREATE INDEX idx_device_id ON users(device_id);

-- 添加is_anonymous列（如果不存在）
ALTER TABLE users ADD COLUMN is_anonymous INT DEFAULT 0;

-- 验证迁移结果
SHOW COLUMNS FROM users;
```

### 方法2：使用迁移脚本

如果你可以通过SSH访问Zeabur服务器：

```bash
# 在项目根目录执行
cd /workspace
python3 migrations/add_device_id_support.py
```

### 方法3：临时添加迁移端点（仅用于开发/测试）

在`services/auth-service/main.py`中临时添加一个迁移端点：

```python
@app.post("/migrate-add-device-id", tags=["Dev"])
async def migrate_add_device_id(db: AsyncSession = Depends(get_async_db)):
    """执行数据库迁移 - 添加设备ID支持"""
    from sqlalchemy import text

    try:
        async with db.begin():
            # 添加device_id列
            await db.execute(text(
                "ALTER TABLE users ADD COLUMN device_id VARCHAR(255) UNIQUE DEFAULT NULL"
            ))
            await db.execute(text(
                "CREATE INDEX idx_device_id ON users(device_id)"
            ))

            # 添加is_anonymous列
            await db.execute(text(
                "ALTER TABLE users ADD COLUMN is_anonymous INT DEFAULT 0"
            ))

        return {"status": "success", "message": "迁移完成"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
```

然后通过浏览器或Postman访问：
```
POST https://photo-english-learn-api-gateway.zeabur.app/auth/migrate-add-device-id
```

**⚠️ 重要：执行完迁移后，请删除此端点！**

## 验证迁移是否成功

访问健康检查端点：
```
GET https://photo-english-learn-api-gateway.zeabur.app/auth/health/db
```

应该返回类似：
```json
{
  "status": "ok",
  "database": "connected",
  "has_device_id": true,
  "has_is_anonymous": true,
  "migration_needed": false
}
```

## 测试匿名登录

迁移完成后，前端应用会自动执行匿名登录。你也可以手动测试：

```bash
curl -X POST https://photo-english-learn-api-gateway.zeabur.app/auth/anonymous-login \
  -H "Content-Type: application/json" \
  -d '{"deviceId":"test-device-123"}'
```

应该返回：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "...",
    "token_type": "bearer",
    "user": {
      "user_id": 1,
      "username": "anonymous_xxxxx",
      "email": "anonymous_xxxxx@anonymous.local",
      ...
    }
  }
}
```

## 常见问题

### Q: 仍然收到500错误
A:
1. 检查auth-service日志：在Zeabur控制台查看auth-service的日志
2. 访问`/auth/health/db`检查数据库连接状态
3. 确认数据库迁移已成功执行

### Q: device_id字段冲突
A: 如果添加device_id时遇到唯一索引冲突，可能是因为有多个NULL值。可以先清理数据或修改迁移脚本。

### Q: 如何回滚迁移
A:
```sql
ALTER TABLE users DROP COLUMN device_id;
ALTER TABLE users DROP COLUMN is_anonymous;
DROP INDEX idx_device_id ON users;
```

## 部署检查清单

- [ ] 代码已推送到GitHub
- [ ] Zeabur已自动部署最新代码
- [ ] 数据库迁移已执行
- [ ] 访问`/auth/health/db`确认数据库状态正常
- [ ] 测试匿名登录功能正常
- [ ] 前端应用可以正常加载
