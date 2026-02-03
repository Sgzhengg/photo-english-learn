# 配置 Groq API 密钥 - Zeabur 部署指南

## 🔑 Groq API 密钥

**请替换为您的实际 Groq API 密钥**

获取方式：访问 https://groq.com 注册并创建 API 密钥

---

## 📋 在 Zeabur 上配置环境变量

### 方法1：通过 Zeabur 控制台（推荐）

#### 步骤1：打开项目配置
1. 登录 [Zeabur](https://zeabur.com)
2. 选择 `photo-english-learn` 项目
3. 点击 **"Variables"** 标签页

#### 步骤2：添加环境变量
点击 **"New Variable"** 按钮，添加：

**变量名**：`GROQ_API_KEY`
**变量值**：`gsk_您的Groq_API密钥`（替换为您的实际密钥）

#### 步骤3：重新部署服务
需要重新部署以下服务以应用环境变量：
- ✅ api-gateway
- ✅ asr-service

点击每个服务的 **"Redeploy"** 按钮。

---

### 方法2：通过 Zeabur CLI

如果您安装了 Zeabur CLI：

```bash
# 设置环境变量（请替换为您的实际密钥）
zeabur variables set GROQ_API_KEY=gsk_您的Groq_API密钥

# 重新部署服务
zeabur restart api-gateway
zeabur restart asr-service
```

---

## ✅ 验证配置

### 检查环境变量是否生效

在 Zeabur 控制台中：
1. 进入 `api-gateway` 服务
2. 点击 **"Logs"** 标签
3. 搜索日志中的 `GROQ_API_KEY` 或 `Groq`

### 测试跟读功能

1. 打开应用
2. 进入"场景描述"页面
3. 点击"开始跟读"
4. 录音并提交
5. **应该看到真实的语音识别结果**，不再是模拟数据

---

## 🔍 故障排查

### 问题1：仍然返回模拟数据

**检查**：
1. 环境变量是否正确设置（注意不要有多余空格）
2. 服务是否已重新部署
3. 查看服务日志是否有错误

**解决**：
```bash
# 查看日志
zeabur logs api-gateway --tail 100

# 搜索 Groq 相关日志
zeabur logs api-gateway | grep -i groq
```

---

### 问题2：仍然报 403 错误

**可能原因**：
1. API 密钥复制错误（检查是否有空格或换行）
2. API 密钥已过期或被撤销
3. Groq 服务暂时不可用

**解决**：
1. 重新复制密钥，确保完整
2. 访问 https://groq.com 确认密钥有效
3. 查看 Groq 状态页面：https://status.groq.com

---

### 问题3：其他错误

查看完整错误信息：
```bash
zeabur logs asr-service --tail 50
```

常见错误：
- `Connection timeout`: 网络问题
- `Rate limit exceeded`: 超过免费额度限制
- `Invalid API key`: 密钥格式错误

---

## 📊 Groq 免费额度说明

根据 Groq 官方文档：

### 免费额度
- ✅ **每月请求数**：大量请求
- ✅ **速率限制**：宽松的限制
- ✅ **支持模型**：
  - Whisper Large V3（语音识别）
  - LLaMA 3 系列（文本生成）
  - Mixtral 系列（文本生成）

### 适用场景
- ✅ 个人项目
- ✅ 开发测试
- ✅ 小型应用
- ✅ 教育项目

### 限制
- ⚠️ 商业使用需要付费计划
- ⚠️ 有速率限制（但非常宽松）

---

## 🎯 跟读功能说明

### 功能流程

1. **用户点击"开始跟读"**
2. **浏览器录制音频**
3. **音频发送到 asr-service**
4. **asr-service 调用 Groq Whisper API**
5. **Groq 识别音频文本**
6. **系统对比原句和识别结果**
7. **计算评分并显示反馈**

### 使用的模型
```python
model = "whisper-large-v3"  # Groq 上的 Whisper 模型
language = "en"  # 英语
```

### 评分标准
- **准确度 (50%)**：识别文本与原句的匹配度
- **流利度 (30%)**：完整度和准确度的综合
- **完整度 (20%)**：说出的单词数量

---

## 🚀 性能优化

### 当前配置
- 超时时间：60秒
- 音频格式：MP3
- 采样率：自动检测

### 优化建议（如需要）

如果遇到超时或性能问题：

1. **调整超时时间**（在 `shared/asr/recognizer.py`）：
```python
async with httpx.AsyncClient(timeout=120.0) as client:  # 增加到120秒
```

2. **限制音频大小**：
```python
MAX_AUDIO_SIZE = 10 * 1024 * 1024  # 10MB
```

3. **添加重试机制**：
```python
max_retries = 3
for attempt in range(max_retries):
    try:
        # API 调用
        break
    except Exception:
        if attempt == max_retries - 1:
            raise
```

---

## 📝 相关文件

### 代码文件
- `shared/asr/recognizer.py` - 语音识别器实现
- `services/asr-service/main.py` - ASR 服务入口
- `zeabur.yaml` - 环境变量配置

### 文档文件
- `FIX_PRONUNCIATION_403.md` - 403 错误修复说明

---

## ✅ 配置完成清单

- [x] 代码已修复（支持 Groq API）
- [x] 配置文件已更新（使用 `${GROQ_API_KEY}`）
- [x] 配置指南已创建
- [ ] **需要在 Zeabur 上手动添加环境变量** ← 下一步
- [ ] 重新部署 api-gateway
- [ ] 重新部署 asr-service
- [ ] 测试跟读功能

---

## 🎉 下一步操作

### 立即操作

1. **在 Zeabur 控制台添加环境变量**：
   - 变量名：`GROQ_API_KEY`
   - 变量值：`gsk_您的Groq_API密钥`（替换为您的实际密钥）

2. **重新部署服务**：
   - api-gateway
   - asr-service

3. **测试跟读功能**：
   - 打开应用
   - 进入"场景描述"
   - 点击"开始跟读"
   - 录音并查看识别结果

---

## 💡 提示

- API 密钥已添加到环境变量引用 `${GROQ_API_KEY}`，不会被提交到 Git
- 代码已包含 403 错误处理，即使配置失败也会优雅降级
- Groq 免费额度足够个人和小型项目使用
- 如需更换密钥，只需在 Zeabur 控制台更新环境变量即可
