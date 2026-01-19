"""
共享数据库连接配置
支持 PostgreSQL 和 MySQL
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from typing import Generator, AsyncGenerator
import os
from contextlib import asynccontextmanager

# 数据库配置 (自动检测使用 PostgreSQL 或 MySQL)
def get_database_url(async_mode: bool = True) -> str:
    """获取数据库 URL，优先使用 PostgreSQL"""
    db_type = os.getenv("DB_TYPE", "postgresql")  # postgresql 或 mysql

    if db_type == "postgresql":
        host = os.getenv("POSTGRES_HOST", "localhost")
        port = os.getenv("POSTGRES_PORT", "5432")
        user = os.getenv("POSTGRES_USER", "photo_english")
        password = os.getenv("POSTGRES_PASSWORD", "default_password_123")
        database = os.getenv("POSTGRES_DB", "photo_english")

        if async_mode:
            return f"postgresql+asyncpg://{user}:{password}@{host}:{port}/{database}"
        else:
            return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"
    else:  # mysql
        host = os.getenv("MYSQL_HOST", "localhost")
        port = os.getenv("MYSQL_PORT", "3306")
        user = os.getenv("MYSQL_USER", "photo_english")
        password = os.getenv("MYSQL_PASSWORD", "default_password_123")
        database = os.getenv("MYSQL_DATABASE", "photo_english")

        if async_mode:
            return f"mysql+aiomysql://{user}:{password}@{host}:{port}/{database}"
        else:
            return f"mysql+pymysql://{user}:{password}@{host}:{port}/{database}"

# 异步数据库连接
async_engine = create_async_engine(
    get_database_url(async_mode=True),
    echo=False,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

# 创建异步会话工厂
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

# 创建同步引擎（用于 Alembic 迁移）
sync_engine = create_engine(
    get_database_url(async_mode=False),
    echo=False,
    pool_pre_ping=True,
)

# 创建同步会话工厂
SessionLocal = sessionmaker(
    sync_engine,
    autocommit=False,
    autoflush=False,
)


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """获取异步数据库会话"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def get_db() -> Generator[Session, None, None]:
    """获取同步数据库会话"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


@asynccontextmanager
async def get_async_db_context():
    """异步数据库上下文管理器"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
