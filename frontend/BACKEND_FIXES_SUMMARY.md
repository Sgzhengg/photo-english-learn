# 后端问题修复总结

**修复日期**: 2026-01-31
**状态**: ✅ 代码修复完成，等待部署

---

## 已修复的问题

### 1. ✅ 登录端点响应格式不统一

**文件**: `services/auth-service/main.py` (第 215-255 行)

**修复内容**:
- 移除 `response_model=Token`
- 将错误处理从 `HTTPException` 改为 `success_response(code=-1, ...)`
- 将成功响应从 `Token(...)` 改为 `success_response(data={...})`

**修改前**:
```python
@app.post("/login", response_model=Token, tags=["Auth"])
async def login(...):
    if not user or not verify_password(...):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )
    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )
```

**修改后**:
```python
@app.post("/login", tags=["Auth"])
async def login(...):
    if not user or not verify_password(...):
        return success_response(
            code=-1,
            message="用户名或密码错误",
            data=None
        )
    return success_response(data={
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user).model_dump()
    })
```

---

### 2. ✅ /auth/me 端点响应格式不统一

**文件**: `services/auth-service/main.py` (第 258-267 行)

**修复内容**:
- 移除 `response_model=UserResponse`
- 使用 `success_response()` 包装返回数据

**修改前**:
```python
@app.get("/me", response_model=UserResponse, tags=["Auth"])
async def get_current_user_info(...):
    return UserResponse.model_validate(current_user)
```

**修改后**:
```python
@app.get("/me", tags=["Auth"])
async def get_current_user_info(...):
    return success_response(
        data=UserResponse.model_validate(current_user).model_dump()
    )
```

---

### 3. ✅ /refresh 端点响应格式不统一

**文件**: `services/auth-service/main.py` (第 270-290 行)

**修复内容**:
- 移除 `response_model=Token`
- 使用 `success_response()` 包装返回数据

**修改前**:
```python
@app.post("/refresh", response_model=Token, tags=["Auth"])
async def refresh_token(...):
    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(current_user)
    )
```

**修改后**:
```python
@app.post("/refresh", tags=["Auth"])
async def refresh_token(...):
    return success_response(data={
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(current_user).model_dump()
    })
```

---

### 4. ✅ 密码重置错误格式不统一

**文件**: `services/auth-service/main.py` (第 293-359 行)

**修复内容**:
- 将所有 3 个 `HTTPException` 改为 `success_response(code=-1, ...)`

**修改位置**:
1. 参数验证错误 (第 314-318 行)
2. 用户不存在 (第 332-338 行)
3. 密码长度验证 (第 341-347 行)

**修改示例**:
```python
# 修改前
if not all([email_or_phone, verification_code, new_password]):
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="请提供邮箱、验证码和新密码"
    )

# 修改后
if not all([email_or_phone, verification_code, new_password]):
    return success_response(
        code=-1,
        message="请提供邮箱、验证码和新密码",
        data=None
    )
```

---

### 5. ✅ /user/me 端点响应格式不统一

**文件**: `services/auth-service/main.py` (第 383-392 行)

**修复内容**:
- 移除 `response_model=UserResponse`
- 使用 `success_response()` 包装返回数据

**修改前**:
```python
@app.get("/user/me", response_model=UserResponse, tags=["User"])
async def get_user_me(...):
    return UserResponse.model_validate(current_user)
```

**修改后**:
```python
@app.get("/user/me", tags=["User"])
async def get_user_me(...):
    return success_response(
        data=UserResponse.model_validate(current_user).model_dump()
    )
```

---

### 6. ✅ /user/preferences 404 问题

**文件**: `services/api-gateway/main.py` (第 56-91 行)

**问题原因**:
- `/user/preferences` 被 Gateway 移除 `/user` 前缀后转发为 `/preferences`
- 但 auth-service 的端点是 `/user/preferences`，导致 404

**修复内容**:
- 新增 `PRESERVE_PREFIX_ROUTES` 列表
- 修改 `determine_service()` 函数，对 `/user` 开头的路径保留完整路径

**修改前**:
```python
def determine_service(path: str) -> Tuple[str, str]:
    # ...
    elif path.startswith(prefix + "/"):
        # 路径以该前缀开头，去掉前缀
        return service, path[len(prefix):]
```

**修改后**:
```python
# 不移除前缀的路由（保留完整路径）
PRESERVE_PREFIX_ROUTES = ["/user"]

def determine_service(path: str) -> Tuple[str, str]:
    # ...
    elif path.startswith(prefix + "/"):
        # 检查是否需要保留完整路径
        if prefix in PRESERVE_PREFIX_ROUTES:
            # 对于 /user 等前缀，保留完整路径
            return service, "/" + original_path
        else:
            # 路径以该前缀开头，去掉前缀
            return service, path[len(prefix):]
```

---

## 修改的文件列表

1. **services/auth-service/main.py**
   - 修复 5 个端点的响应格式
   - 涉及行数: 215-255, 258-267, 270-290, 293-359, 383-392

2. **services/api-gateway/main.py**
   - 修复 `/user/*` 路由问题
   - 涉及行数: 56-91

---

## 部署步骤

### 方式 1: 通过 Zeabur 控制台重新部署

1. 打开 [Zeabur 控制台](https://zeabur.com/)
2. 找到 `photo-english-learn` 项目
3. 重新部署以下服务：
   - ✅ **auth-service** (必需)
   - ✅ **api-gateway** (必需)

### 方式 2: 通过 Git 推送触发部署

如果已配置自动部署，只需推送修复后的代码：

```bash
# 1. 提交修复
git add services/auth-service/main.py services/api-gateway/main.py
git commit -m "fix: unify API response format and fix /user/preferences routing

- Fix /auth/login endpoint to use unified response format
- Fix /auth/me endpoint to use unified response format
- Fix /auth/refresh endpoint to use unified response format
- Fix /auth/reset-password to use unified error format
- Fix /user/me endpoint to use unified response format
- Fix /user/preferences 404 error by preserving /user prefix in gateway
- Replace all HTTPException with success_response(code=-1, ...)"

# 2. 推送到远程仓库
git push origin main
```

---

## 验证修复

部署完成后，运行以下测试命令验证：

### 1. 测试登录端点
```bash
curl -X POST "https://photo-english-learn-api-gateway.zeabur.app/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser12345", "password": "password123"}'
```

**预期结果**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "eyJ...",
    "token_type": "bearer",
    "user": {
      "username": "testuser12345",
      "email": "testuser12345@example.com",
      ...
    }
  }
}
```

### 2. 测试获取用户信息
```bash
curl -X GET "https://photo-english-learn-api-gateway.zeabur.app/auth/me" \
  -H "Authorization: Bearer <token>"
```

**预期结果**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "username": "testuser12345",
    "email": "testuser12345@example.com",
    ...
  }
}
```

### 3. 测试用户偏好设置
```bash
curl -X PATCH "https://photo-english-learn-api-gateway.zeabur.app/user/preferences" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"englishLevel": "intermediate", "dailyGoal": "20"}'
```

**预期结果**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "message": "偏好设置已更新",
    "englishLevel": "intermediate",
    "dailyGoal": "20"
  }
}
```

### 4. 测试密码重置（错误情况）
```bash
curl -X POST "https://photo-english-learn-api-gateway.zeabur.app/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "nonexistent@example.com",
    "verificationCode": "123456",
    "newPassword": "newpassword123"
  }'
```

**预期结果**:
```json
{
  "code": -1,
  "message": "用户不存在",
  "data": null
}
```

---

## 测试检查清单

部署后请验证：

- [ ] 登录成功返回 `{code: 0, message: "success", data: {access_token, user}}`
- [ ] 登录失败返回 `{code: -1, message: "用户名或密码错误", data: null}`
- [ ] 获取用户信息返回 `{code: 0, message: "success", data: {user}}`
- [ ] 更新用户偏好返回 200 而非 404
- [ ] 密码重置（用户不存在）返回 `{code: -1, message: "用户不存在", data: null}`
- [ ] 刷新 token 返回 `{code: 0, message: "success", data: {access_token, user}}`

---

## 影响范围

### 前端需要调整的代码

如果前端之前有特殊处理这些端点的代码，需要调整：

#### 1. 登录响应处理
**文件**: `src/lib/api.ts`

当前前端可能期望的格式：
```typescript
const { access_token, user } = data
```

需要调整为：
```typescript
const { access_token, user } = data.data
```

#### 2. 获取用户信息响应处理
**文件**: `src/lib/api.ts`

当前：
```typescript
return api.get<User>('/auth/me')
```

可能需要调整为：
```typescript
const response = await api.get<{ data: User }>('/auth/me')
return response.data.data
```

#### 3. 刷新 token 响应处理
与登录类似，需要访问 `response.data.data.access_token`

---

## 后续优化建议

1. **统一所有端点格式**: 检查其他服务（vision, word, practice, tts）是否也有格式不统一的问题

2. **添加 API 文档**: 使用 Swagger/OpenAPI 自动生成文档，明确响应格式

3. **添加集成测试**: 编写自动化测试确保所有端点格式统一

4. **前端适配**: 更新前端代码以适应新的统一响应格式

---

## 总结

本次修复解决了 6 个响应格式不统一的问题：

✅ 登录端点 - 统一为 `{code, message, data}` 格式
✅ 获取用户信息 - 统一为 `{code, message, data}` 格式
✅ 刷新 token - 统一为 `{code, message, data}` 格式
✅ 密码重置 - 错误时使用统一格式
✅ 用户信息获取 - 统一为 `{code, message, data}` 格式
✅ 用户偏好设置 - 修复 404 错误

**下一步**: 重新部署 auth-service 和 api-gateway 服务

---

**修复完成时间**: 2026-01-31
**修复人员**: Claude (AI Assistant)
**文档版本**: 1.0
