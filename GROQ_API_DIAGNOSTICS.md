# Groq API 403 错误诊断指南

## 当前状态

**症状**: ASR 服务调用 Groq Whisper API 时返回 403 Forbidden 错误

**错误日志**:
```
INFO:httpx:HTTP Request: POST https://api.groq.com/openai/v1/audio/transcriptions "HTTP/1.1 403 Forbidden"
WARNING:shared.asr.recognizer:Groq API key invalid or lacks permission (403)
```

## 已确认信息

根据 Groq 官方文档 ([Speech to Text - GroqDocs](https://console.groq.com/docs/speech-to-text)):

1. **Groq 支持 Whisper API** ✅
   - 端点: `https://api.groq.com/openai/v1/audio/transcriptions`
   - 模型: `whisper-large-v3-turbo` 或 `whisper-large-v3`
   - 格式: OpenAI 兼容

2. **当前代码实现正确** ✅
   - 端点使用正确
   - 模型名称正确 (`whisper-large-v3`)
   - 请求格式符合规范

3. **API Key 格式正确** ✅
   - 前缀: `gsk_`
   - 长度: 约 56 字符

## 可能的原因

### 1. 环境变量格式问题 ⚠️ (最可能)

**问题**: 在 Zeabur UI 中输入 API key 时可能包含了:
- 多余的空格
- 引号 (单引号或双引号)
- 其他不可见字符

**如何检查**:
1. 在 Zeabur 中查看 asr-service 的**启动日志**
2. 查找以 `ASR Service Starting...` 开头的部分
3. 检查 `GROQ_API_KEY` 相关的输出，应该看到类似:
   ```
   GROQ_API_KEY: Present (length=56)
     - Format: OK (starts with gsk_)
     - Preview: gsk_Zow6Po...3g4Hyv
   ```

**如果看到警告**:
- `WARNING: Has leading/trailing whitespace!` → API key 有空格
- `WARNING: Has quotes!` → API key 有引号

### 2. API Key 本身无效 ⚠️

**可能情况**:
- API key 已过期
- API key 被撤销
- API key 复制时出错

**如何验证**:
1. 在本地运行测试脚本:
   ```bash
   # Windows PowerShell
   $env:GROQ_API_KEY='YOUR_GROQ_API_KEY_HERE'
   python test_groq_whisper.py
   ```

2. 或者直接在 [Groq Console](https://console.groq.com) 中验证

### 3. Groq 账户权限问题 ⚠️

**可能情况**:
- 账户未激活音频转录功能
- 账户余额不足
- API key 权限配置不正确

**如何检查**:
1. 登录 [Groq Console](https://console.groq.com)
2. 查看 API Keys 页面
3. 确认 key 的权限包括 "Audio Transcription"

## 解决步骤

### 第一步: 检查启动日志

1. 打开 Zeabur 项目
2. 选择 `asr-service` 服务
3. 点击 "Logs" 标签
4. 查找最近的启动日志 (部署后的日志)
5. 复制包含 `GROQ_API_KEY` 检查的部分

**期望看到的输出**:
```
============================================================
ASR Service Starting...
============================================================
GROQ_API_KEY: Present (length=56)
  - Format: OK (starts with gsk_)
  - Preview: gsk_Zow6Po...3g4Hyv
============================================================
```

**如果看到的不是这样**:
- 长度不是 56
- 前缀不是 `gsk_`
- 有 WARNING 提示

则说明环境变量格式有问题。

### 第二步: 重新配置环境变量

在 Zeabur UI 中:

1. 删除现有的 `GROQ_API_KEY` (api-gateway 和 asr-service)
2. 重新添加，确保:
   - ✅ 没有前导/尾随空格
   - ✅ 没有引号
   - ✅ 完整复制整个 key (包括 `gsk_` 前缀)
   - ✅ 粘贴后不要编辑

**正确的值**:
```
YOUR_GROQ_API_KEY_HERE
```

**错误的值**:
```
"YOUR_GROQ_API_KEY_HERE"  ❌ 有引号
 YOUR_GROQ_API_KEY_HERE   ❌ 有前导空格
YOUR_GROQ_API_KEY_HERE     ❌ 有尾随空格
```

### 第三步: 本地测试 API Key

运行本地测试脚本验证 API key 是否有效:

```bash
# Windows PowerShell
$env:GROQ_API_KEY='YOUR_GROQ_API_KEY_HERE'
python test_groq_whisper.py
```

**期望输出**:
```
Status Code: 200
✓ SUCCESS! API key is valid and transcription works!
```

**如果看到 403**:
说明 API key 本身可能无效，需要:
1. 重新生成 API key
2. 或联系 Groq 支持

### 第四步: 使用更快的模型 (可选)

如果 API key 有效，可以尝试使用 `whisper-large-v3-turbo` 模型:
- 速度更快 (216x vs 189x)
- 价格更低 ($0.04/h vs $0.111/h)
- 准确度略低 (12% WER vs 10.3% WER)

修改 `shared/asr/recognizer.py` 第 220 行:
```python
data = {
    "model": "whisper-large-v3-turbo",  # 改用 turbo 模型
    "language": language.split("-")[0],
    "response_format": "verbose_json"
}
```

## 快速检查清单

- [ ] 在 Zeabur 中查看了 asr-service 启动日志
- [ ] 确认 GROQ_API_KEY 被正确读取
- [ ] 没有 WARNING 提示 (空格/引号)
- [ ] 本地测试 API key 可以成功调用
- [ ] Zeabur 中重新配置了环境变量
- [ ] 重新部署了 asr-service

## 参考资源

- [Groq Speech-to-Text 文档](https://console.groq.com/docs/speech-to-text)
- [Groq API Reference](https://console.groq.com/docs/api-reference)
- [Whisper Large v3 模型文档](https://console.groq.com/docs/model/whisper-large-v3)
- [Groq Console](https://console.groq.com)
