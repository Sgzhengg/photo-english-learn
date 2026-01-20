# 🔴 Zeabur 数据库架构不匹配问题报告

## 问题描述

Word Service 无法正常工作，所有查询端点返回 HTTP 500 错误。

## 错误信息

```
sqlalchemy.exc.ProgrammingError:
column words.phonetic_us does not exist

[SQL: SELECT words.word_id, words.english_word, words.chinese_meaning,
       words.phonetic_us, words.phonetic_uk, ...
FROM words ...]
```

## 根本原因

**代码模型定义与实际数据库表结构不匹配**

### 代码定义 (shared/database/models.py)
```python
class Word(Base):
    __tablename__ = "words"
    word_id = Column(Integer, primary_key=True)
    english_word = Column(String(100), unique=True, nullable=False)
    chinese_meaning = Column(Text)
    phonetic_us = Column(String(50))   # ❌ 数据库中不存在
    phonetic_uk = Column(String(50))   # ❌ 数据库中不存在
    audio_url = Column(String(512))
    example_sentence = Column(Text)
    example_translation = Column(Text)
    image_url = Column(String(512))
    created_at = Column(DateTime, default=utc_now)
```

### 实际数据库表结构
```sql
-- words 表只有这些字段：
word_id, english_word, chinese_meaning, audio_url,
example_sentence, example_translation, image_url, created_at
-- ❌ 缺少 phonetic_us 和 phonetic_uk
```

## 已尝试的修复步骤

### 1. ✅ 在 PostgreSQL 中添加缺失字段
```sql
ALTER TABLE words ADD COLUMN phonetic_us VARCHAR(50);
ALTER TABLE words ADD COLUMN phonetic_uk VARCHAR(50);
```

**结果**: 字段添加成功（通过 `SELECT column_name FROM information_schema.columns` 验证）

### 2. ✅ 重启 Word Service
**结果**: 无效，仍然报同样的错误

### 3. ✅ 完全重新部署 Word Service
**结果**: 无效，仍然报同样的错误

### 4. ✅ 检查 Word Service 环境变量
**发现**: `DATABASE_URL` 环境变量不存在

**尝试修复**: 添加 `DATABASE_URL` 环境变量
```
DATABASE_URL=postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DATABASE}
```

**结果**: 添加后重新部署，仍然报同样的错误

## 🔍 核心问题分析

### 可能的原因：

1. **Word Service 连接到了错误的数据库**
   - 有多个 PostgreSQL 实例
   - `DATABASE_URL` 指向了不同的数据库
   - 或者使用了默认的测试数据库

2. **SQLAlchemy 连接池缓存了旧的表结构**
   - 即使数据库已更新，连接池仍使用旧的元数据
   - 需要完全重置连接池

3. **环境变量未正确传递**
   - Zeabur 的变量替换语法 `${POSTGRES_XXX}` 可能不工作
   - 需要使用完整值而不是变量引用

4. **多个数据库 schema**
   - 可能连接到了不同的 schema（如 `public` vs 其他）

## 🎯 需要的解决方案

### 方案 1：确保 Word Service 连接到正确的数据库

**验证步骤**：
1. 在 Zeabur Word Service 的环境中，找到并复制完整的 `POSTGRES_URI` 或相关连接信息
2. 使用**完整的、硬编码的** `DATABASE_URL`，例如：
   ```
   DATABASE_URL=postgresql+asyncpg://postgres:actual_password@actual-host:5432/actual-database
   ```
3. 不要使用变量替换语法

**关键**：确认 Word Service 连接到的数据库与你在 PostgreSQL 控制台操作的数据库是**同一个**。

### 方案 2：使用 Alembic 数据库迁移

1. 创建 Alembic 迁移脚本添加 `phonetic_us` 和 `phonetic_uk` 字段
2. 在服务启动时自动运行迁移
3. 确保所有环境的数据库结构一致

### 方案 3：检查服务依赖配置

在 Zeabur 中：
1. 确保 Word Service **正确绑定/链接**到 PostgreSQL 服务
2. 使用 Zeabur 的服务依赖功能，让 `DATABASE_URL` 自动注入
3. 不要手动配置环境变量，而是让 Zeabur 自动处理

## 📝 给 Zeabur AI 的具体请求

### 请帮我诊断并修复以下问题：

1. **确认数据库连接**
   - Word Service 当前连接到哪个数据库？
   - 是否与我在 PostgreSQL 控制台操作的数据库相同？
   - 如何验证？

2. **正确配置环境变量**
   - Word Service 应该如何正确连接到 PostgreSQL？
   - 是用环境变量还是服务依赖？
   - 正确的 `DATABASE_URL` 格式是什么？

3. **数据库架构同步**
   - 如何确保代码模型与数据库表结构一致？
   - 应该手动修改数据库还是使用迁移工具？
   - 推荐的最佳实践是什么？

4. **连接池问题**
   - SQLAlchemy 的连接池是否需要特殊配置？
   - 如何清除缓存的表结构元数据？
   - 是否需要设置 `pool_pre_ping=True` 或其他选项？

## 当前状态

- ✅ 数据库中字段已存在（通过 SQL 验证）
- ✅ 代码模型定义正确
- ❌ Word Service 仍报告字段不存在
- ❌ 所有查询端点返回 500 错误
- ❌ 无法测试 Redis 缓存和限流功能

## 受影响的功能

1. Word Service 所有查询端点
2. Redis 缓存功能测试（依赖 Word Service）
3. 请求限流功能测试（依赖 Word Service）

## 下一步

请 Zeabur AI 帮助：
1. 诊断为什么数据库字段存在但服务找不到
2. 提供正确的配置方法
3. 确保 Word Service 能连接到正确的数据库

---

**创建时间**: 2026-01-20 10:45
**优先级**: 🔴 紧急 - 阻塞所有测试
