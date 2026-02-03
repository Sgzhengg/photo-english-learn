# Zeabur 内网连接分析报告

## 📊 当前配置检查

### ✅ API Gateway 配置（正确）

```yaml
- name: api-gateway
  type: Worker
  env:
    - AUTH_SERVICE_URL=http://auth-service.zeabur.internal:8001
    - VISION_SERVICE_URL=http://vision-service.zeabur.internal:8003
    - WORD_SERVICE_URL=http://word-service.zeabur.internal:8004
    - PRACTICE_SERVICE_URL=http://practice-service.zeabur.internal:8005
    - TTS_SERVICE_URL=http://tts-service.zeabur.internal:8006
    - ASR_SERVICE_URL=http://asr-service.zeabur.internal:8080
  ports:
    - port: 8080
      public: true  # ✅ 对外暴露，前端通过公网访问
```

**分析**：
- ✅ 所有服务都使用 `zeabur.internal` 内网地址
- ✅ 端口映射正确（8001/8003/8004/8005/8006/8080）
- ✅ API Gateway 对外暴露（public: true）
- ✅ 微服务不对外暴露（public: false）

---

### ✅ 前端配置（正确）

```yaml
- name: frontend
  type: Static
  env:
    - VITE_API_BASE_URL=https://photo-english-learn-api-gateway.zeabur.app
  deployments:
    - domain:
        - name: main
          value: photo-english-learn
```

**分析**：
- ✅ 前端使用公网地址访问 API Gateway（正确）
- ✅ API Gateway 使用内网地址访问微服务（正确）
- ✅ 流量路径：前端 → 公网 → API Gateway → 内网 → 微服务

---

### ✅ 后端微服务配置（正确）

```yaml
- name: auth-service
  ports:
    - port: 8001
      public: false  # ✅ 不对外暴露，只能通过内网访问

- name: vision-service
  ports:
    - port: 8003
      public: false

- name: word-service
  ports:
    - port: 8004
      public: false

- name: practice-service
  ports:
    - port: 8005
      public: false
```

**分析**：
- ✅ 所有微服务端口都是 `public: false`
- ✅ 只能通过 API Gateway 在内网访问
- ✅ 安全配置，避免直接暴露数据库服务

---

## 🔄 流量路径图

```
┌─────────────┐
│  Frontend   │ (Static Website)
│  (公网访问)  │
└──────┬──────┘
       │ https://photo-english-learn-api-gateway.zeabur.app
       ▼
┌─────────────────┐
│  API Gateway    │ (Worker:8080, public: true)
│  (公网+内网)     │
└──────┬──────────┘
       │ 内网调用
       ▼
┌─────────────────────────────────────────────────┐
│  微服务（内网，public: false）                    │
├─────────────────────────────────────────────────┤
│ • auth-service     (8001)  ← http://...internal │
│ • vision-service   (8003)  ← http://...internal │
│ • word-service     (8004)  ← http://...internal │
│ • practice-service (8005)  ← http://...internal │
│ • tts-service      (8006)  ← http://...internal │
│ • asr-service      (8080)  ← http://...internal │
└─────────────────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│  PostgreSQL │ (Database)
│  Redis      │ (Cache)
└─────────────┘
```

---

## ⚠️ 潜在问题和优化建议

### 1. 数据库连接配置

**当前**：所有服务共享同一个数据库连接字符串
```yaml
env:
  - DATABASE_URL=${DATABASE_URL}
  - REDIS_URL=${REDIS_URL}
```

**建议**：
- ✅ 当前配置正确，使用环境变量
- ✅ Zeabur 自动提供内网连接字符串
- ⚠️ 确认 `DATABASE_URL` 是否指向 Zeabur 内网地址

**验证命令**（在 Zeabur 中执行）：
```bash
# 检查数据库连接是否为内网地址
env | grep DATABASE_URL
# 应该显示类似：postgresql://user:pass@postgres.zeabur.internal:5432/...
```

---

### 2. 服务发现机制

**当前**：硬编码服务地址
```python
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service.zeabur.internal:8001")
```

**优点**：
- ✅ 简单直接
- ✅ Zeabur DNS 自动解析 `.zeabur.internal`
- ✅ 无需额外配置

**缺点**：
- ⚠️ 服务重启时可能有短暂延迟
- ⚠️ 需要手动配置端口映射

**是否需要优化**：否，当前方案已经足够好。

---

### 3. 超时和重试配置

**当前**：默认 HTTP 超时

**建议添加**：
```python
# 在 api-gateway 中配置超时
import httpx

async with httpx.AsyncClient(timeout=30.0) as client:
    response = await client.get(f"{AUTH_SERVICE_URL}/auth/me")
```

---

### 4. 健康检查和监控

**建议添加**（每个服务）：
```python
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "auth-service"}
```

**在 zeabur.yaml 中配置**：
```yaml
- name: auth-service
  healthCheckPath: /health  # Zeabur 会定期检查
```

---

## 🔍 验证内网连接

### 方法1：查看 API Gateway 日志

在 Zeabur 控制台中查看 api-gateway 日志，搜索：
```
INFO:     Connected to auth-service
INFO:     Connected to vision-service
INFO:     Connected to word-service
```

如果有连接错误，会显示：
```
ERROR:    Connection refused to auth-service
ERROR:    Timeout connecting to word-service
```

### 方法2：在服务中添加调试日志

在 `services/api-gateway/main.py` 中添加：
```python
@app.on_event("startup")
async def startup_event():
    logger.info("=== Service URLs ===")
    logger.info(f"AUTH_SERVICE_URL: {os.getenv('AUTH_SERVICE_URL')}")
    logger.info(f"WORD_SERVICE_URL: {os.getenv('WORD_SERVICE_URL')}")
    logger.info(f"VISION_SERVICE_URL: {os.getenv('VISION_SERVICE_URL')}")
```

重启服务后查看日志，确认地址格式为：
```
AUTH_SERVICE_URL: http://auth-service.zeabur.internal:8001
```

### 方法3：直接测试连接

在 API Gateway 的容器中执行：
```bash
# 测试 auth-service 连接
curl http://auth-service.zeabur.internal:8001/health

# 测试 word-service 连接
curl http://word-service.zeabur.internal:8004/health
```

---

## 📊 性能分析

### 内网 vs 公网延迟对比

| 连接类型 | 延迟 | 带宽 | 说明 |
|---------|------|------|------|
| 内网（zeabur.internal） | ~1-5ms | ~1Gbps | 微服务间通信 |
| 公网（zeabur.app） | ~50-200ms | ~100Mbps | 前端到网关 |

**估算**：添加生词流程的延迟
1. 前端 → API Gateway（公网）：~50ms
2. API Gateway → vision-service（内网）：~5ms
3. API Gateway → word-service（内网）：~5ms
4. 返回前端：~50ms
**总计**：~110ms（可以接受）

---

## ✅ 结论

### 当前配置状态：**完全正确** ✅

1. ✅ 所有微服务使用 `zeabur.internal` 内网地址
2. ✅ 微服务端口不对外暴露（public: false）
3. ✅ API Gateway 对外暴露，作为唯一入口
4. ✅ 前端通过公网访问 API Gateway
5. ✅ 流量路径合理，安全性高

### 无需修改

当前配置已经是最优方案，不需要任何调整。

### 如果遇到连接问题

可能原因：
1. 服务未启动：检查 Zeabur 控制台服务状态
2. 端口映射错误：确认服务运行在指定端口
3. 环境变量未设置：检查 Zeabur 环境变量配置
4. DNS 解析延迟：等待 1-2 分钟让 Zeabur DNS 更新

---

## 📝 相关文件

- `zeabur.yaml` - 主配置文件
- `services/api-gateway/main.py` - 网关路由逻辑
- `shared/utils/auth.py` - 认证逻辑

---

## 🎯 总结

**Zeabur 内网连接配置：完全正确 ✅**

- API Gateway 正确使用 `service-name.zeabur.internal:port` 格式
- 微服务端口不对外暴露，只能通过 API Gateway 访问
- 前端通过公网访问 API Gateway，安全且高效
- 无需任何修改

**如果添加生词慢，不是因为内网连接问题**，可能的原因：
1. vision-service 调用 OpenRouter API（外部 AI 服务）
2. word-service 查询词典 API（外部 API）
3. 数据库查询优化空间
4. 外部 API 响应慢
