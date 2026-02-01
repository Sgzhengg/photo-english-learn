"""
认证相关工具函数
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from shared.database.models import User
from shared.database.database import get_async_db

# 开发模式配置：跳过认证
# 在环境变量中设置 SKIP_AUTH=true 来启用开发模式
SKIP_AUTH = os.getenv("SKIP_AUTH", "false").lower() == "true"

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# HTTP Bearer 认证
security = HTTPBearer()
# 可选认证（auto_error=False 表示没有 token 也不会报错）
security_optional = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """哈希密码"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(
    data: Dict[str, Any],
    secret_key: str,
    algorithm: str = "HS256",
    expires_delta: Optional[timedelta] = None
) -> str:
    """创建 JWT Token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, secret_key, algorithm=algorithm)
    return encoded_jwt


def decode_access_token(
    token: str,
    secret_key: str,
    algorithm: str = "HS256"
) -> Optional[Dict[str, Any]]:
    """解码 JWT Token"""
    try:
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        return payload
    except JWTError:
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_async_db)
) -> User:
    """
    从 JWT Token 中获取当前用户

    依赖注入函数，用于需要认证的路由

    DEV MODE: 如果 SKIP_AUTH=true，返回虚拟用户
    """
    # DEV MODE: 跳过认证，返回虚拟用户
    if SKIP_AUTH:
        # 创建一个虚拟用户对象（不需要保存到数据库）
        dev_user = User(
            user_id=999999,
            username="dev_user",
            email="dev@example.com",
            phone_number=None,
            nickname="开发用户",
            avatar_url=None,
            english_level="intermediate",
            daily_goal=20,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        return dev_user

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无法验证认证信息",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials
    secret_key = get_secret_key()

    payload = decode_access_token(token, secret_key)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    result = await db.execute(select(User).where(User.user_id == int(user_id)))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    return user


def get_secret_key() -> str:
    """获取 JWT 密钥"""
    import os
    return os.getenv("JWT_SECRET", "your-secret-key-change-this-in-production")


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional),
    db: AsyncSession = Depends(get_async_db)
) -> Optional[User]:
    """
    从 JWT Token 中获取当前用户（可选）

    依赖注入函数，用于可选认证的路由
    如果没有提供 Token 或 Token 无效，返回 None

    DEV MODE: 如果 SKIP_AUTH=true，返回虚拟用户
    """
    # DEV MODE: 跳过认证，返回虚拟用户
    if SKIP_AUTH:
        # 创建一个虚拟用户对象（不需要保存到数据库）
        dev_user = User(
            user_id=999999,
            username="dev_user",
            email="dev@example.com",
            phone_number=None,
            nickname="开发用户",
            avatar_url=None,
            english_level="intermediate",
            daily_goal=20,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        return dev_user

    if credentials is None:
        return None

    token = credentials.credentials
    secret_key = get_secret_key()

    payload = decode_access_token(token, secret_key)
    if payload is None:
        return None

    user_id: str = payload.get("sub")
    if user_id is None:
        return None

    result = await db.execute(select(User).where(User.user_id == int(user_id)))
    user = result.scalar_one_or_none()

    return user  # 可能是 None
