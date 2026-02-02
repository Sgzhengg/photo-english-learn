# Zeabur AI 后端服务全面测试提示词

## 测试目标

对 PhotoEnglish 项目的所有后端服务进行全面测试，确保所有 API 端点正常工作，数据格式正确，业务逻辑符合预期。

## 测试环境

- **API Gateway 地址**: `https://photo-english-learn-api-gateway.zeabur.app`
- **测试时间**: 当前时间
- **测试范围**: 所有后端服务

## 测试服务列表

1. **API Gateway** - 网关服务
2. **Auth Service** - 认证服务
3. **Vision Service** - 视觉识别服务
4. **Word Service** - 单词服务
5. **Practice Service** - 练习服务
6. **TTS Service** - 文字转语音服务
7. **ASR Service** - 语音识别服务

---

## 详细测试用例

### 1. API Gateway 健康检查

#### 测试 1.1: 根路径健康检查
```bash
curl -X GET "https://photo-english-learn-api-gateway.zeabur.app/"
```

**预期结果**:
```json
{
  "code": 0,
  "message": "API Gateway is running",
  "data": {
    "service": "api-gateway",
    "services": ["auth", "vision", "word", "practice", "tts", "asr"],
    "status": "healthy"
  }
}
```

#### 测试 1.2: 检查所有后端服务健康状态
```bash
curl -X GET "https://photo-english-learn-api-gateway.zeabur.app/health" --max-time 60
```

**预期结果**: 返回所有服务的健康状态，每个服务状态应为 "healthy" 或包含 "response_time"

---

### 2. Auth Service (认证服务)

#### 测试 2.1: 发送验证码
```bash
curl -X POST "https://photo-english-learn-api-gateway.zeabur.app/auth/send-code" \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone": "test@example.com"}'
```

**预期结果**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "message": "验证码已发送",
    "emailOrPhone": "test@example.com",
    "note": "开发模式：任何 6 位数字都是有效验证码"
  }
}
```

#### 测试 2.2: 用户注册
```bash
curl -X POST "https://photo-english-learn-api-gateway.zeabur.app/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "testuser@example.com",
    "verificationCode": "123456",
    "password": "password123"
  }'
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
      "user_id": 1,
      "username": "testuser",
      "email": "testuser@example.com",
      "nickname": "testuser",
      "avatar_url": null
    }
  }
}
```

**保存 access_token 用于后续测试**

#### 测试 2.3: 用户登录
```bash
curl -X POST "https://photo-english-learn-api-gateway.zeabur.app/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser@example.com",
    "password": "password123"
  }'
```

**预期结果**: 返回 access_token 和用户信息

#### 测试 2.4: 获取当前用户信息
```bash
curl -X GET "https://photo-english-learn-api-gateway.zeabur.app/auth/me" \
  -H "Authorization: Bearer <access_token>"
```

**预期结果**: 返回当前用户信息

#### 测试 2.5: 更新用户偏好设置
```bash
curl -X PATCH "https://photo-english-learn-api-gateway.zeabur.app/user/preferences" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "englishLevel": "intermediate",
    "dailyGoal": "20"
  }'
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

#### 测试 2.6: 重置密码
```bash
curl -X POST "https://photo-english-learn-api-gateway.zeabur.app/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "testuser@example.com",
    "verificationCode": "123456",
    "newPassword": "newpassword123"
  }'
```

**预期结果**: 返回成功消息

#### 测试 2.7: 用户登出
```bash
curl -X POST "https://photo-english-learn-api-gateway.zeabur.app/auth/logout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>"
```

**预期结果**: 返回登出成功消息

---

### 3. Vision Service (视觉识别服务)

#### 测试 3.1: 上传图片进行 OCR 识别
```bash
curl -X POST "https://photo-english-learn-api-gateway.zeabur.app/vision/analyze" \
  -H "Authorization: Bearer <access_token>" \
  -F "file=@/path/to/test-image.jpg"
```

**预期结果**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "photo": {
      "id": "...",
      "url": "...",
      "sceneDescription": "A person working on a laptop...",
      "sceneTranslation": "一个人在笔记本电脑上工作...",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "words": [
      {
        "word": "laptop",
        "translation": "笔记本电脑",
        "phonetic": "/ˈlæptɒp/",
        "partOfSpeech": "noun",
        "definition": "A portable computer...",
        "example": "I work on my laptop every day.",
        "positionInSentence": 3
      }
    ]
  }
}
```

---

### 4. Word Service (单词服务)

#### 测试 4.1: 获取单词库
```bash
curl -X GET "https://photo-english-learn-api-gateway.zeabur.app/word" \
  -H "Authorization: Bearer <access_token>"
```

**预期结果**: 返回用户单词库

#### 测试 4.2: 获取单词详情
```bash
curl -X GET "https://photo-english-learn-api-gateway.zeabur.app/word/1" \
  -H "Authorization: Bearer <access_token>"
```

**预期结果**: 返回单词详细信息

#### 测试 4.3: 获取标签列表
```bash
curl -X GET "https://photo-english-learn-api-gateway.zeabur.app/tags" \
  -H "Authorization: Bearer <access_token>"
```

**预期结果**: 返回用户的所有标签

---

### 5. Practice Service (练习服务)

#### 测试 5.1: 生成练习题
```bash
curl -X POST "https://photo-english-learn-api-gateway.zeabur.app/practice/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "type": "scene-sentence",
    "count": 5
  }'
```

**预期结果**: 返回生成的练习题列表

#### 测试 5.2: 提交练习答案
```bash
curl -X POST "https://photo-english-learn-api-gateway.zeabur.app/practice/1/submit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "userAnswer": "laptop",
    "timeSpent": 30
  }'
```

**预期结果**: 返回练习结果和正确答案

#### 测试 5.3: 获取学习进度
```bash
curl -X GET "https://photo-english-learn-api-gateway.zeabur.app/progress" \
  -H "Authorization: Bearer <access_token>"
```

**预期结果**: 返回学习进度统计

---

### 6. TTS Service (文字转语音服务)

#### 测试 6.1: 语音合成
```bash
curl -X POST "https://photo-english-learn-api-gateway.zeabur.app/tts/synthesize" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "text": "Hello, this is a test.",
    "voice": "default",
    "language": "en-US"
  }'
```

**预期结果**: 返回音频文件或音频 URL

#### 测试 6.2: 获取可用声音列表
```bash
curl -X GET "https://photo-english-learn-api-gateway.zeabur.app/tts/voices" \
  -H "Authorization: Bearer <access_token>"
```

**预期结果**: 返回可用的声音列表

---

### 7. ASR Service (语音识别服务)

#### 测试 7.1: 语音识别配置
```bash
curl -X GET "https://photo-english-learn-api-gateway.zeabur.app/asr/config"
```

**预期结果**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "supported_languages": ["en-US", "en-GB", "zh-CN"],
    "supported_engines": ["groq-whisper", "openai-whisper", "azure", "baidu"],
    "default_engine": "groq-whisper",
    "default_language": "en-US",
    "max_audio_size": 26214400,
    "supported_formats": ["mp3", "wav", "m4a", "ogg", "flac"]
  }
}
```

#### 测试 7.2: 获取可用识别引擎
```bash
curl -X GET "https://photo-english-learn-api-gateway.zeabur.app/asr/engines"
```

**预期结果**: 返回可用的语音识别引擎列表，应包含 groq-whisper

#### 测试 7.3: 发音评分
```bash
curl -X POST "https://photo-english-learn-api-gateway.zeabur.app/asr/evaluate-pronunciation" \
  -H "Authorization: Bearer <access_token>" \
  -F "audio_file=@/path/to/test-audio.mp3" \
  -F "target_text=I am working on my laptop" \
  -F "language=en-US"
```

**预期结果**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "recorded_text": "I am working on my laptop",
    "target_text": "I am working on my laptop",
    "score": {
      "overall": 95,
      "accuracy": 96,
      "fluency": 94,
      "completeness": 95,
      "feedback": "太棒了！发音非常标准！"
    }
  }
}
```

---

## 测试检查清单

### 基础功能检查
- [ ] API Gateway 正常运行
- [ ] 所有服务健康检查通过
- [ ] 用户可以注册新账号
- [ ] 用户可以登录
- [ ] 用户可以获取个人信息
- [ ] 用户可以更新偏好设置
- [ ] 用户可以重置密码
- [ ] 用户可以登出

### 核心功能检查
- [ ] 图片上传和 OCR 识别
- [ ] 单词库查询
- [ ] 练习题生成
- [ ] 练习答案提交
- [ ] 学习进度统计

### AI 功能检查
- [ ] TTS 文字转语音
- [ ] ASR 语音识别
- [ ] ASR 发音评分（Groq Whisper）

### 数据格式检查
- [ ] 所有响应都使用统一格式 `{code, message, data}`
- [ ] 错误响应格式正确 `{code: -1, message, data: null}`
- [ ] JWT token 认证正常工作
- [ ] CORS 配置正确

---

## 测试要求

1. **全面性**: 测试所有列出的端点
2. **准确性**: 验证返回数据格式符合预期
3. **一致性**: 确保所有响应使用统一的 API 格式
4. **记录详细**: 记录每个测试的结果，包括：
   - 端点 URL
   - 请求方法
   - 请求参数
   - 响应状态码
   - 响应内容
   - 是否通过/失败
   - 失败原因（如果有）

5. **问题报告**: 如果发现任何问题，请详细记录：
   - 问题描述
   - 错误日志
   - 重现步骤
   - 建议的修复方案

---

## 预期测试结果

所有测试应该：
- ✅ 返回 HTTP 状态码 200
- ✅ 响应格式统一：`{code: 0, message: "success", data: {...}}`
- ✅ 数据结构完整且正确
- ✅ 业务逻辑符合预期
- ✅ 认证授权正常工作

---

## 开始测试

请按照上述测试用例，逐一测试所有后端服务端点，并生成详细的测试报告。
