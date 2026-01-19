# API 接口测试与分析报告

生成时间: 2026-01-19
项目: Photo English Learn (拍照学英语)

## 一、项目概述

这是一个基于 FastAPI 的微服务架构项目,包含 5 个独立的服务:

1. **auth-service** (端口 8001) - 认证服务
2. **vision-service** (端口 8003) - 视觉服务
3. **word-service** (端口 8004) - 单词服务
4. **practice-service** (端口 8005) - 练习服务
5. **tts-service** (端口 8006) - TTS 服务

## 二、API 端点清单

### 1. Auth Service (认证服务)

| 方法 | 端点 | 描述 | 认证要求 |
|------|------|------|----------|
| GET | `/` | 健康检查 | 否 |
| POST | `/register` | 用户注册 | 否 |
| POST | `/login` | 用户登录 | 否 |
| GET | `/me` | 获取当前用户信息 | 是 |
| POST | `/refresh` | 刷新 Token | 是 |

### 2. Vision Service (视觉服务)

| 方法 | 端点 | 描述 | 认证要求 |
|------|------|------|----------|
| GET | `/` | 健康检查 | 否 |
| POST | `/analyze` | 分析场景照片 | 否 (可选) |
| GET | `/objects/{scene_id}` | 获取场景中的物体列表 | 是 |
| GET | `/scenes` | 获取用户的场景列表 | 否 (可选) |

### 3. Word Service (单词服务)

| 方法 | 端点 | 描述 | 认证要求 |
|------|------|------|----------|
| GET | `/` | 健康检查 | 否 |
| GET | `/list` | 获取用户的生词列表 | 是 |
| POST | `/add` | 添加生词到生词库 | 是 |
| GET | `/{word_id}` | 获取单词详情 | 是 |
| PUT | `/{word_id}/tag` | 更新生词的标签 | 是 |
| DELETE | `/{word_id}` | 从生词库中删除单词 | 是 |
| GET | `/search/{query}` | 搜索单词(全局) | 否 |
| GET | `/lookup/{english_word}` | 查询单词(含API) | 否 |
| GET | `/tags/list` | 获取所有标签 | 否 |

### 4. Practice Service (练习服务)

| 方法 | 端点 | 描述 | 认证要求 |
|------|------|------|----------|
| GET | `/` | 健康检查 | 否 |
| POST | `/generate` | 基于场景生成英语短句 | 否 (可选) |
| GET | `/sentences/{scene_id}` | 获取场景的所有短句 | 是 |
| GET | `/review` | 获取待复习的单词列表 | 否 (可选) |
| POST | `/review/{word_id}` | 提交复习结果 | 是 |
| GET | `/progress` | 获取复习进度统计 | 是 |

### 5. TTS Service (语音合成服务)

| 方法 | 端点 | 描述 | 认证要求 |
|------|------|------|----------|
| GET | `/` | 健康检查 | 否 |
| POST | `/synthesize` | 合成语音 | 否 (可选) |
| GET | `/voices` | 获取可用的音色列表 | 否 |

## 三、发现的错误与问题

### 🔴 严重错误 (Critical Errors)

#### 1. **word-service/main.py:273** - 路由冲突
**位置**: `services/word-service/main.py:257-279`

```python
@app.get("/search/{query}", response_model=List[WordResponse], tags=["Words"])  # Line 257
async def search_words(...)

@app.get("/lookup/{english_word}", response_model=WordResponse, tags=["Words"])  # Line 282
async def lookup_word(...)

@app.get("/{word_id}", response_model=WordResponse, tags=["Words"])  # Line 166
async def get_word_detail(...)
```

**问题**: 路由 `/{word_id}` 会匹配所有 GET 请求,导致 `/search/{query}` 和 `/lookup/{english_word}` 永远无法被访问到。

**影响**:
- `/search/cup` 会被 `/{word_id}` 匹配,尝试将 "search" 作为 word_id 处理
- `/lookup/cup` 会被 `/{word_id}` 匹配,尝试将 "lookup" 作为 word_id 处理

**修复方案**: 将具体的路由放在通用路由之前:
```python
# 正确的顺序
@app.get("/search/{query}", ...)  # 具体路由放前面
@app.get("/lookup/{english_word}", ...)
@app.get("/{word_id}", ...)  # 通用路由放最后
```

#### 2. **word-service/main.py:318** - 路由冲突 (Tags)
**位置**: `services/word-service/main.py:318-335`

```python
@app.get("/tags/list", response_model=List[dict], tags=["Tags"])  # Line 318
async def get_tags(...)
```

**问题**: 虽然这个路由看起来独立,但由于前面提到的 `/{word_id}` 路由问题,`/tags/list` 也会被错误匹配。

#### 3. **practice-service/main.py:130** - 路由冲突
**位置**: `services/practice-service/main.py:130-158`

```python
@app.get("/review", response_model=List[ReviewRecordResponse], tags=["Practice"])  # Line 130
async def get_review_list(...)

@app.post("/review/{word_id}", response_model=dict, tags=["Practice"])  # Line 161
async def submit_review(...)
```

**问题**: 虽然一个 GET 一个 POST,但如果使用 GET 方法访问 `/review/123`,可能会匹配错误的端点。

### 🟡 中等问题 (Medium Priority Issues)

#### 4. **缺少必需的环境变量处理**
**位置**: 多个文件

```python
# shared/database/database.py:13-38
def get_database_url(async_mode: bool = True) -> str:
    db_type = os.getenv("DB_TYPE", "postgresql")
    host = os.getenv("POSTGRES_HOST", "localhost")
    # ...
```

**问题**: 如果环境变量未设置,会使用默认值,但在生产环境可能导致连接失败。

**建议**: 在服务启动时验证必需的环境变量。

#### 5. **datetime.utcnow() 已弃用**
**位置**: 所有使用 `datetime.utcnow()` 的地方

```python
# shared/database/models.py:24
created_at = Column(DateTime, default=datetime.utcnow)  # Deprecated in Python 3.12+
```

**问题**: `datetime.utcnow()` 在 Python 3.12+ 中已弃用,应使用 `datetime.now(timezone.utc)`。

**影响**: 虽然目前仍可工作,但会在未来版本中移除,且会产生 DeprecationWarning。

#### 6. **认证服务中的可选用户参数**
**位置**: 多个服务文件

```python
# services/vision-service/main.py:54-59
@app.post("/analyze", response_model=SceneResponse, tags=["Vision"])
async def analyze_scene(
    ...
    current_user: Annotated[User, Depends(get_current_user)] = None,  # 可选认证
    ...
```

**问题**: 使用 `= None` 使认证变成可选的,但 `get_current_user` 函数没有处理 None 的情况,可能导致 500 错误。

**正确的做法**:
- 要么创建一个可选的依赖: `get_current_user_optional`
- 要么移除 `= None`,要求必须认证

#### 7. **scene_understanding.py 中的同步调用**
**位置**: `shared/vision/scene_understanding.py:87-91`

```python
# services/practice-service/main.py:87-91
sentence_data = scene_understanding.generate_sentence(
    scene.description or "",
    object_names,
    difficulty
)
```

**问题**: 在异步路由中使用同步函数调用,可能阻塞事件循环。

**建议**: 使用 `AsyncSceneUnderstanding` 类的异步方法。

### 🟢 轻微问题 (Minor Issues)

#### 8. **缺少错误日志记录**
**位置**: 所有服务

**问题**: 大部分异常只是打印到控制台 (`print(f"Error: {e}")`),没有使用日志系统。

**建议**: 使用 Python logging 模块记录错误。

#### 9. **TTS 服务中的临时文件未清理**
**位置**: `services/tts-service/main.py:69-77`

```python
with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
    tmp.write(audio_data)
    tmp_path = tmp.name

# 返回文件后,临时文件不会被删除
return FileResponse(tmp_path, ...)
```

**问题**: 临时文件 `delete=False` 后不会被自动清理,会积累在系统中。

**建议**: 使用后台任务清理或使用 `delete=True` 并配合正确的实现。

#### 10. **数据库连接池配置可能过高**
**位置**: `shared/database/database.py:41-47`

```python
async_engine = create_async_engine(
    get_database_url(async_mode=True),
    pool_size=10,
    max_overflow=20,
)
```

**问题**: 每个服务都有独立的连接池,5个服务 × 30 个连接 = 150 个数据库连接,可能超过默认限制。

## 四、需要修复的问题汇总

### 必须立即修复 (Critical)

1. ✅ **word-service 路由顺序** - 将具体路由移到通用路由前
2. ✅ **practice-service 路由顺序** - 检查并修复可能的冲突

### 应该修复 (High Priority)

3. ✅ **datetime.utcnow() 弃用** - 替换为 `datetime.now(timezone.utc)`
4. ✅ **可选认证处理** - 实现正确的可选认证依赖
5. ✅ **异步函数使用** - 在异步路由中使用异步函数

### 建议修复 (Medium Priority)

6. ✅ **环境变量验证** - 添加启动时检查
7. ✅ **日志系统** - 替换 print 为 logging
8. ✅ **临时文件清理** - 修复 TTS 服务的内存泄漏
9. ✅ **数据库连接池** - 调整配置或使用共享连接池

## 五、测试建议

由于当前环境没有安装依赖且服务未运行,建议:

1. **安装依赖**: `pip install -r shared/requirements.txt`
2. **设置环境变量**: 复制 `.env.example` 为 `.env` 并配置
3. **启动数据库**: PostgreSQL 或 MySQL
4. **运行数据库迁移**: 使用 Alembic
5. **启动服务**: 每个服务运行 `python services/{service-name}/main.py`
6. **运行测试**: `python test_apis.py`

## 六、修复后的测试计划

修复完成后,应测试:
1. 所有健康检查端点
2. 用户注册和登录流程
3. 带认证的端点
4. 路由冲突问题是否解决
5. 异步操作是否正常
6. 错误处理是否正确

---

**注**: 本报告基于静态代码分析,未实际运行服务。实际错误可能需要运行后才能完全确认。
