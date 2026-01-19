# 拍照学英语 - 系统架构设计

## 项目概述

将原 "积流成河" (Streams to River) 英语学习应用改造为"拍照学英语"应用。用户可以通过拍照识别场景中的物体，学习相关英文单词，并生成趣味短句进行学习。

## 核心功能

1. **拍照识别**：用户拍摄场景照片，系统识别物体和场景
2. **交互式选择**：用户点击照片中的物体进行选择
3. **单词学习**：显示选中物体的英文单词，保存到生词库
4. **短句生成**：基于场景生成有趣的英语短句
5. **语音跟读**：TTS 语音合成，用户模仿练习
6. **复习系统**：基于艾宾浩斯遗忘曲线的生词复习

## 微服务拆分方案

### 服务架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client Frontend                         │
│                      (Vue 3 + Vant UI)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   API Gateway │◄──┤ Auth Service  │   │ User Service  │
│  (Nginx/Kong) │   │  (FastAPI)    │   │  (FastAPI)    │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                    │
        │    ┌──────────────┼──────────────┐    │
        │    │              │              │    │
        ▼    ▼              ▼              ▼    ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   Vision      │ │    Word       │ │   Practice    │
│   Service     │ │    Service    │ │   Service     │
│  (FastAPI)    │ │  (FastAPI)    │ │  (FastAPI)    │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                  │                  │
        │         ┌────────┴────────┐        │
        │         │                 │        │
        ▼         ▼                 ▼        ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│   Redis       │ │    MySQL      │ │   MinIO/S3    │
│   (缓存)      │ │  (主数据库)    │ │  (图片存储)   │
└───────────────┘ └───────────────┘ └───────────────┘
```

### 服务清单

| 服务名称 | 技术栈 | 端口 | 职责 |
|---------|--------|------|------|
| **api-gateway** | Nginx | 80/443 | API 网关、路由转发、负载均衡 |
| **auth-service** | FastAPI | 8001 | 用户认证、JWT 签发、权限验证 |
| **user-service** | FastAPI | 8002 | 用户管理、个人信息、偏好设置 |
| **vision-service** | FastAPI | 8003 | 图像识别、目标检测、场景理解 |
| **word-service** | FastAPI | 8004 | 单词管理、生词库、标签系统 |
| **practice-service** | FastAPI | 8005 | 短句生成、复习系统、学习记录 |
| **tts-service** | FastAPI | 8006 | 语音合成、发音评分 |
| **frontend** | Vue 3 + Nginx | 3000/80 | 前端应用 |

## 数据库设计

### 核心数据表

```sql
-- 用户表
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- 场景照片表
CREATE TABLE scenes (
    scene_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    image_url VARCHAR(512) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- 检测物体表
CREATE TABLE detected_objects (
    object_id INT PRIMARY KEY AUTO_INCREMENT,
    scene_id INT NOT NULL,
    object_name VARCHAR(100) NOT NULL,
    english_word VARCHAR(100) NOT NULL,
    confidence FLOAT,
    bounding_box JSON,  -- {x, y, width, height}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scene_id) REFERENCES scenes(scene_id) ON DELETE CASCADE,
    INDEX idx_scene_id (scene_id),
    INDEX idx_english_word (english_word)
);

-- 单词表
CREATE TABLE words (
    word_id INT PRIMARY KEY AUTO_INCREMENT,
    english_word VARCHAR(100) NOT NULL,
    chinese_meaning TEXT,
    phonetic_us VARCHAR(50),
    phonetic_uk VARCHAR(50),
    audio_url VARCHAR(512),
    example_sentence TEXT,
    example_translation TEXT,
    image_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_english_word (english_word),
    INDEX idx_english_word (english_word)
);

-- 用户生词表
CREATE TABLE user_words (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    word_id INT NOT NULL,
    scene_id INT,  -- 来源场景
    tag_id INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (word_id) REFERENCES words(word_id) ON DELETE CASCADE,
    FOREIGN KEY (scene_id) REFERENCES scenes(scene_id) ON DELETE SET NULL,
    UNIQUE KEY uk_user_word (user_id, word_id),
    INDEX idx_user_id (user_id),
    INDEX idx_tag_id (tag_id)
);

-- 场景短句表
CREATE TABLE scene_sentences (
    sentence_id INT PRIMARY KEY AUTO_INCREMENT,
    scene_id INT NOT NULL,
    sentence_text TEXT NOT NULL,
    sentence_translation TEXT,
    audio_url VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scene_id) REFERENCES scenes(scene_id) ON DELETE CASCADE,
    INDEX idx_scene_id (scene_id)
);

-- 复习记录表
CREATE TABLE review_records (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    word_id INT NOT NULL,
    level INT DEFAULT 0,
    next_review_time TIMESTAMP NOT NULL,
    total_correct INT DEFAULT 0,
    total_wrong INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (word_id) REFERENCES words(word_id) ON DELETE CASCADE,
    INDEX idx_user_next_review (user_id, next_review_time),
    INDEX idx_word_id (word_id)
);

-- 标签表
CREATE TABLE tags (
    tag_id INT PRIMARY KEY AUTO_INCREMENT,
    tag_name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 跟读记录表
CREATE TABLE practice_records (
    record_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    sentence_id INT NOT NULL,
    user_audio_url VARCHAR(512),
    pronunciation_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sentence_id) REFERENCES scene_sentences(sentence_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);
```

## API 设计

### 认证服务 (Auth Service)

```
POST   /api/v1/auth/register     # 用户注册
POST   /api/v1/auth/login        # 用户登录
POST   /api/v1/auth/refresh      # 刷新 Token
POST   /api/v1/auth/logout       # 登出
```

### 用户服务 (User Service)

```
GET    /api/v1/user/profile      # 获取个人信息
PUT    /api/v1/user/profile      # 更新个人信息
GET    /api/v1/user/stats        # 学习统计
```

### 视觉服务 (Vision Service)

```
POST   /api/v1/vision/analyze    # 分析场景照片
POST   /api/v1/vision/detect     # 检测物体
GET    /api/v1/vision/objects/:scene_id  # 获取场景中的物体
```

### 单词服务 (Word Service)

```
GET    /api/v1/words/list        # 获取生词列表
POST   /api/v1/words/add         # 添加生词
GET    /api/v1/words/:word_id    # 获取单词详情
PUT    /api/v1/words/:word_id/tag # 更新标签
DELETE /api/v1/words/:word_id    # 删除生词
GET    /api/v1/words/search      # 搜索单词
```

### 练习服务 (Practice Service)

```
POST   /api/v1/practice/generate  # 生成场景短句
GET    /api/v1/practice/sentences/:scene_id  # 获取场景短句
POST   /api/v1/practice/submit    # 提交跟读记录
GET    /api/v1/practice/review    # 获取待复习列表
POST   /api/v1/practice/review/:word_id  # 提交复习结果
GET    /api/v1/practice/progress  # 获取复习进度
```

### TTS 服务 (TTS Service)

```
POST   /api/v1/tts/synthesize    # 合成语音
GET    /api/v1/tts/:text         # 获取语音（缓存）
```

## 技术栈

### 后端技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| Web 框架 | FastAPI | 高性能异步 Python Web 框架 |
| ORM | SQLAlchemy | Python SQL 工具包和 ORM |
| 数据库驱动 | asyncpg (PostgreSQL) / aiomysql | 异步数据库驱动 |
| 缓存 | Redis | 内存数据库 |
| 任务队列 | Celery + Redis | 异步任务处理 |
| 图像处理 | OpenCV, Pillow | 图像处理库 |
| AI 模型 | transformers, diffusers | Hugging Face 模型 |
| 目标检测 | YOLOv8 / Grounding DINO | 物体检测模型 |
| 视觉理解 | GPT-4V / Claude-3.5-Vision | 多模态大模型 |
| TTS | Edge-TTS / Azure TTS | 语音合成 |
| 认证 | JWT + Passlib | JWT 认证和密码加密 |

### 前端技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| 框架 | Vue 3 | 渐进式 JavaScript 框架 |
| UI 库 | Vant 4 | 移动端 Vue 组件库 |
| 状态管理 | Pinia | Vue 状态管理 |
| 路由 | Vue Router | 官方路由管理器 |
| HTTP | Axios | HTTP 客户端 |
| 构建工具 | Vite | 下一代前端构建工具 |

### 基础设施

| 组件 | 技术 | 说明 |
|------|------|------|
| 数据库 | MySQL 8.0 | 关系型数据库 |
| 缓存 | Redis 7.0 | 内存数据库 |
| 对象存储 | MinIO / S3 | 对象存储 |
| 网关 | Nginx | 反向代理和负载均衡 |
| 容器化 | Docker | 容器技术 |
| 部署平台 | Zeabur | 云部署平台 |
| 监控 | Prometheus + Grafana | 监控和可视化 |

## 部署到 Zeabur

### Zeabor 服务配置

每个微服务将配置为独立的 Zeabur 服务：

```yaml
# 示例: auth-service
services:
  - type: worker
    name: auth-service
    env: docker
    dockerfilePath: ./services/auth/Dockerfile
    dockerContext: ./services/auth
    envVars:
      - key: DATABASE_URL
        value: ${MYSQL_URL}
      - key: REDIS_URL
        value: ${REDIS_URL}
      - key: JWT_SECRET
        value: ${JWT_SECRET}
```

### 环境变量

```env
# 数据库
MYSQL_HOST=mysql.zeabur.app
MYSQL_PORT=3306
MYSQL_DATABASE=photo_english
MYSQL_USER=root
MYSQL_PASSWORD=***

# Redis
REDIS_HOST=redis.zeabur.app
REDIS_PORT=6379
REDIS_PASSWORD=***

# MinIO/S3
MINIO_ENDPOINT=s3.zeabur.app
MINIO_ACCESS_KEY=***
MINIO_SECRET_KEY=***
MINIO_BUCKET=photo-english

# AI 服务
OPENAI_API_KEY=***
ANTHROPIC_API_KEY=***

# JWT
JWT_SECRET=***
```

## 项目目录结构

```
photo-english-learn/
├── services/
│   ├── api-gateway/           # API 网关
│   │   ├── nginx.conf
│   │   └── Dockerfile
│   ├── auth-service/          # 认证服务
│   │   ├── app/
│   │   │   ├── api/
│   │   │   ├── models/
│   │   │   └── main.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   ├── user-service/          # 用户服务
│   ├── vision-service/        # 视觉服务
│   ├── word-service/          # 单词服务
│   ├── practice-service/      # 练习服务
│   └── tts-service/           # TTS 服务
├── client/                    # 前端应用
│   ├── src/
│   │   ├── views/
│   │   ├── components/
│   │   ├── store/
│   │   └── App.vue
│   ├── package.json
│   └── vite.config.ts
├── shared/                    # 共享代码
│   ├── database/
│   │   ├── migrations/
│   │   └── schema.sql
│   └── types/
├── docker-compose.yml         # 本地开发
├── zeabur.yml                 # Zeabur 配置
└── README.md
```

## 开发计划

### Phase 1: 基础设施搭建
- [ ] 项目初始化和目录结构创建
- [ ] 数据库设计和迁移脚本
- [ ] Docker Compose 本地开发环境
- [ ] 共享代码库（数据库模型、工具函数）

### Phase 2: 核心服务开发
- [ ] 认证服务
- [ ] 用户服务
- [ ] 单词服务

### Phase 3: AI 能力集成
- [ ] 视觉服务（目标检测 + 场景理解）
- [ ] 短句生成服务
- [ ] TTS 语音合成服务

### Phase 4: 前端开发
- [ ] 基础框架搭建
- [ ] 拍照识别页面
- [ ] 单词学习页面
- [ ] 复习练习页面
- [ ] 个人中心页面

### Phase 5: 部署和优化
- [ ] Zeabur 部署配置
- [ ] 性能优化
- [ ] 测试和文档
