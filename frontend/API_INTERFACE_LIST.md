# PhotoEnglish API 接口文档

## 基础信息

- **Base URL**: `https://photo-english-learn-api-gateway.zeabur.app:8080`
- **认证方式**: Bearer Token (JWT)
- **Content-Type**: `application/json`
- **开发模式**: Mock API (localStorage 模拟)

---

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误信息",
  "message": "详细错误描述"
}
```

---

## 1. 认证 API (Auth API)

### 1.1 用户登录
```
POST /api/auth/login
```

**请求体:**
```json
{
  "emailOrPhone": "string",  // 邮箱或手机号
  "password": "string",       // 密码
  "keepLoggedIn": boolean     // 是否保持登录
}
```

**响应:**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresAt": number,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "phone": "string",
    "nickname": "string",
    "avatar": "string",
    "englishLevel": "beginner|intermediate|advanced",
    "dailyGoal": "10|20|30|50",
    "status": "active",
    "createdAt": "ISO8601",
    "lastLoginAt": "ISO8601",
    "hasCompletedOnboarding": boolean
  }
}
```

### 1.2 用户注册
```
POST /api/auth/register
```

**请求体:**
```json
{
  "emailOrPhone": "string",
  "verificationCode": "string",  // 6位验证码
  "password": "string"
}
```

**响应:** 同登录接口

### 1.3 发送验证码
```
POST /api/auth/send-code
```

**请求体:**
```json
{
  "emailOrPhone": "string"
}
```

**响应:**
```json
{
  "message": "验证码已发送"
}
```

### 1.4 刷新 Token
```
POST /api/auth/refresh
```

**请求体:**
```json
{
  "refreshToken": "string"
}
```

**响应:**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresAt": number
}
```

### 1.5 获取当前用户信息
```
GET /api/auth/me
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**响应:**
```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "phone": "string",
  "nickname": "string",
  "avatar": "string",
  "englishLevel": "string",
  "dailyGoal": "string",
  "status": "string",
  "createdAt": "string",
  "lastLoginAt": "string",
  "hasCompletedOnboarding": boolean
}
```

### 1.6 重置密码
```
POST /api/auth/reset-password
```

**请求体:**
```json
{
  "emailOrPhone": "string",
  "verificationCode": "string",
  "newPassword": "string"
}
```

**响应:**
```json
{
  "message": "密码重置成功"
}
```

### 1.7 登出
```
POST /api/auth/logout
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**响应:**
```json
{
  "message": "登出成功"
}
```

---

## 2. 用户 API (User API)

### 2.1 更新用户偏好设置
```
PATCH /api/user/preferences
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**请求体:**
```json
{
  "englishLevel": "beginner|intermediate|advanced",
  "dailyGoal": "10|20|30|50"
}
```

**响应:** 返回更新后的用户对象（同 1.5）

### 2.2 更新用户资料
```
PATCH /api/user/profile
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**请求体:**
```json
{
  "nickname": "string",  // 可选
  "avatar": "string"     // 可选
}
```

**响应:** 返回更新后的用户对象（同 1.5）

---

## 3. 拍照识别 API (Photo API)

### 3.1 上传图片进行 OCR 识别
```
POST /api/photo/recognize
```

**请求头:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**请求体:**
```
FormData {
  file: File  // 图片文件
}
```

**响应:**
```json
{
  "photo": {
    "id": "string",
    "userId": "string",
    "imageUrl": "string",
    "thumbnailUrl": "string",
    "capturedAt": "ISO8601",
    "location": "string",
    "status": "processing|completed|failed"
  },
  "words": [
    {
      "id": "string",
      "word": "string",
      "phonetic": "string",
      "definition": "string",
      "pronunciationUrl": "string",
      "isSaved": boolean,
      "positionInSentence": number
    }
  ],
  "sceneDescription": "string",
  "sceneTranslation": "string"
}
```

### 3.2 获取用户照片列表
```
GET /api/photos
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**响应:**
```json
{
  "photos": [
    {
      "id": "string",
      "userId": "string",
      "imageUrl": "string",
      "thumbnailUrl": "string",
      "capturedAt": "ISO8601",
      "location": "string",
      "status": "string"
    }
  ]
}
```

### 3.3 保存单词到生词库
```
POST /api/photo/:photoId/save-words
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**请求体:**
```json
{
  "wordIds": ["string", "string"]
}
```

**响应:**
```json
{
  "words": [
    {
      "id": "string",
      "word": "string",
      "phonetic": "string",
      "definition": "string",
      "partOfSpeech": "string",
      "pronunciationUrl": "string",
      "exampleSentences": [
        {
          "sentence": "string",
          "translation": "string"
        }
      ],
      "tags": ["string"],
      "learningRecord": {
        "addedDate": "ISO8601",
        "reviewCount": number,
        "masteryLevel": "learning|familiar|mastered",
        "lastReviewedAt": "ISO8601"
      }
    }
  ]
}
```

---

## 4. 生词库 API (Vocabulary API)

### 4.1 获取生词库列表
```
GET /api/vocabulary?search={string}&tags={string[]}&masteryLevel={string}&page={number}&limit={number}
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**响应:**
```json
{
  "words": [
    {
      "id": "string",
      "word": "string",
      "phonetic": "string",
      "definition": "string",
      "partOfSpeech": "string",
      "pronunciationUrl": "string",
      "exampleSentences": [
        {
          "sentence": "string",
          "translation": "string"
        }
      ],
      "tags": ["string"],
      "learningRecord": {
        "addedDate": "ISO8601",
        "reviewCount": number,
        "masteryLevel": "learning|familiar|mastered",
        "lastReviewedAt": "ISO8601"
      }
    }
  ],
  "total": number
}
```

### 4.2 获取单词详情
```
GET /api/vocabulary/:wordId
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**响应:** 单个单词对象（同 4.1）

### 4.3 创建标签
```
POST /api/vocabulary/tags
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**请求体:**
```json
{
  "name": "string",
  "color": "string"  // 可选
}
```

**响应:**
```json
{
  "id": "string",
  "name": "string",
  "color": "string"
}
```

### 4.4 获取用户标签列表
```
GET /api/vocabulary/tags
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**响应:**
```json
{
  "tags": [
    {
      "id": "string",
      "name": "string",
      "color": "string"
    }
  ]
}
```

### 4.5 更新单词标签
```
PATCH /api/vocabulary/:wordId/tags
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**请求体:**
```json
{
  "tags": ["string", "string"]
}
```

**响应:** 更新后的单词对象

### 4.6 删除单词
```
DELETE /api/vocabulary/:wordId
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**响应:**
```json
{
  "message": "单词已删除"
}
```

---

## 5. 练习 API (Practice API)

### 5.1 生成练习题
```
POST /api/practice/generate
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**请求体:**
```json
{
  "type": "fill-blank|translation|scene-sentence",
  "count": 10
}
```

**响应:**
```json
{
  "practices": [
    {
      "id": "string",
      "type": "fill-blank|translation|scene-sentence",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "wordId": "string",
      "audioUrl": "string"
    }
  ]
}
```

### 5.2 提交练习答案
```
POST /api/practice/:practiceId/submit
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**请求体:**
```json
{
  "userAnswer": "string",
  "timeSpent": number  // 可选，毫秒
}
```

**响应:**
```json
{
  "practice": {
    "id": "string",
    "type": "string",
    "question": "string",
    "options": ["string"],
    "correctAnswer": "string",
    "userAnswer": "string",
    "isCorrect": boolean,
    "timeSpent": number
  }
}
```

### 5.3 获取练习历史
```
GET /api/practice/history?limit={number}
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**响应:** 练习记录数组

---

## 6. 复习 API (Review API)

### 6.1 获取待复习单词
```
GET /api/review/due
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**响应:**
```json
{
  "reviews": [
    {
      "word": { ... },
      "nextReviewAt": "ISO8601"
    }
  ]
}
```

### 6.2 提交复习答案
```
POST /api/review/:wordId/submit
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**请求体:**
```json
{
  "userAnswer": "string"
}
```

**响应:**
```json
{
  "review": {
    "id": "string",
    "wordId": "string",
    "userAnswer": "string",
    "isCorrect": boolean,
    "reviewedAt": "ISO8601",
    "nextReviewAt": "ISO8601"
  }
}
```

---

## 7. 进度 API (Progress API)

### 7.1 获取学习进度
```
GET /api/progress
```

**请求头:**
```
Authorization: Bearer {accessToken}
```

**响应:**
```json
{
  "overviewStats": {
    "totalWords": number,
    "masteredWords": number,
    "learningWords": number,
    "practiceAccuracy": number,
    "studyDays": number,
    "todayStudyTime": number
  },
  "chartData": {
    "dailyLearning": [
      {
        "date": "string",
        "wordsLearned": number
      }
    ],
    "accuracyTrend": [
      {
        "date": "string",
        "accuracy": number
      }
    ]
  },
  "wordStats": {
    "byMasteryLevel": {
      "mastered": number,
      "familiar": number,
      "learning": number
    }
  },
  "recentActivity": [
    {
      "type": "learned|practiced|reviewed",
      "word": "string",
      "timestamp": "ISO8601"
    }
  ],
  "achievements": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "icon": "string",
      "unlockedAt": "ISO8601"
    }
  ]
}
```

---

## Token 刷新机制

### 自动刷新流程

1. **401 响应处理**: 当任何 API 请求返回 401 状态码时，自动触发 token 刷新
2. **刷新请求**: 使用 `refreshToken` 调用 `/api/auth/refresh`
3. **重试机制**: 刷新成功后，使用新 token 重试原始请求
4. **失败处理**: 刷新失败则清除所有 token 并重定向到登录页

### Token 存储位置

```javascript
localStorage.setItem('access_token', accessToken);
localStorage.setItem('refresh_token', refreshToken);
localStorage.setItem('expires_at', expiresAt.toString());
```

### Token 生命周期

- **Access Token**: 1 小时有效
- **Refresh Token**: 7 天有效
- **自动刷新**: 在 access token 过期前自动刷新

---

## 错误处理

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或 token 过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 错误响应示例

```json
{
  "success": false,
  "error": "INVALID_CREDENTIALS",
  "message": "邮箱或手机号与密码不匹配"
}
```

### 网络错误处理

前端已实现以下错误处理机制：

1. **网络超时**: fetch API 默认超时机制
2. **网络异常**: catch 捕获并返回友好的错误信息
3. **401 自动重定向**: 自动清除 token 并跳转登录页
4. **错误日志**: console.error 记录错误详情

---

## 开发模式 (Mock API)

### 启用条件

```javascript
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || import.meta.env.DEV;
```

### Mock 数据存储

- 使用 `localStorage` 模拟数据库
- 存储键: `photoenglish_mock_users`
- 当前用户键: `photoenglish_mock_current_user`

### Mock 特性

- 验证码: 任意 6 位数字均可
- 延迟模拟: 300-800ms 网络延迟
- 数据持久化: 刷新页面后数据保留

---

## 后端集成检查清单

### 认证模块
- [ ] 用户登录 (`POST /api/auth/login`)
- [ ] 用户注册 (`POST /api/auth/register`)
- [ ] 发送验证码 (`POST /api/auth/send-code`)
- [ ] 刷新 Token (`POST /api/auth/refresh`)
- [ ] 获取当前用户 (`GET /api/auth/me`)
- [ ] 重置密码 (`POST /api/auth/reset-password`)
- [ ] 登出 (`POST /api/auth/logout`)

### 用户模块
- [ ] 更新偏好设置 (`PATCH /api/user/preferences`)
- [ ] 更新用户资料 (`PATCH /api/user/profile`)

### 拍照识别模块
- [ ] OCR 识别 (`POST /api/photo/recognize`)
- [ ] 获取照片列表 (`GET /api/photos`)
- [ ] 保存单词 (`POST /api/photo/:photoId/save-words`)

### 生词库模块
- [ ] 获取单词列表 (`GET /api/vocabulary`)
- [ ] 获取单词详情 (`GET /api/vocabulary/:wordId`)
- [ ] 创建标签 (`POST /api/vocabulary/tags`)
- [ ] 获取标签列表 (`GET /api/vocabulary/tags`)
- [ ] 更新单词标签 (`PATCH /api/vocabulary/:wordId/tags`)
- [ ] 删除单词 (`DELETE /api/vocabulary/:wordId`)

### 练习模块
- [ ] 生成练习题 (`POST /api/practice/generate`)
- [ ] 提交答案 (`POST /api/practice/:practiceId/submit`)
- [ ] 获取历史 (`GET /api/practice/history`)

### 复习模块
- [ ] 获取待复习 (`GET /api/review/due`)
- [ ] 提交复习 (`POST /api/review/:wordId/submit`)

### 进度模块
- [ ] 获取进度 (`GET /api/progress`)

---

## 请求/响应格式规范

### 请求头规范

```http
Content-Type: application/json
Authorization: Bearer {access_token}
```

### 日期格式

使用 ISO 8601 格式: `2024-01-01T00:00:00.000Z`

### 分页参数

```javascript
{
  page: 1,      // 页码，从 1 开始
  limit: 20     // 每页数量
}
```

### 排序参数

```javascript
{
  sortBy: "field",
  order: "asc|desc"
}
```

---

## 安全注意事项

1. **HTTPS**: 生产环境必须使用 HTTPS
2. **Token 存储**: Access token 存储在 localStorage，需考虑 XSS 风险
3. **密码加密**: 前端不加密密码，使用 HTTPS 传输
4. **验证码**: 生产环境需要真实的验证码发送机制
5. **CORS**: 后端需要配置正确的 CORS 策略
