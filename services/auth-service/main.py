"""
认证服务 - 用户注册、登录、JWT 验证
"""
import sys
from pathlib import Path

# 添加项目根目录到 Python 路径（支持 Zeabur 部署）
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from typing import Annotated, Optional
import os

from shared.database.models import User, UserCreate, UserLogin, UserResponse, Token
from shared.database.database import get_async_db
from shared.utils.auth import hash_password, verify_password, create_access_token, get_current_user
from shared.utils.response import success_response

# 初始化 FastAPI 应用
app = FastAPI(
    title="Auth Service",
    description="认证服务 - 用户注册、登录、JWT 验证",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite 默认端口
        "http://localhost:3000",  # 其他常用端口
        "http://localhost:5174",  # 备用端口
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*",  # 开发环境允许所有来源
    ],
    allow_credentials=False,  # 使用 False 时可以用 "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT 配置
SECRET_KEY = os.getenv("JWT_SECRET", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))  # 默认 7 天 (7*24*60=10080)


@app.get("/", tags=["Health"])
async def root():
    """健康检查"""
    return success_response(data={"message": "Auth Service is running", "service": "auth"})


@app.post("/register", response_model=Token, tags=["Auth"])
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_async_db)
):
    """
    用户注册

    - **username**: 用户名（唯一）
    - **email**: 邮箱（唯一）
    - **password**: 密码
    - **nickname**: 昵称（可选）
    """
    # 检查用户名是否已存在
    result = await db.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )

    # 检查邮箱是否已存在
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已被注册"
        )

    # 创建新用户
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        nickname=user_data.nickname or user_data.username,
        password_hash=hash_password(user_data.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # 生成 JWT Token
    access_token = create_access_token(
        data={"sub": str(new_user.user_id), "username": new_user.username},
        secret_key=SECRET_KEY,
        algorithm=ALGORITHM,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(new_user)
    )


@app.post("/login", response_model=Token, tags=["Auth"])
async def login(
    user_data: UserLogin,
    db: AsyncSession = Depends(get_async_db)
):
    """
    用户登录

    - **username**: 用户名
    - **password**: 密码
    """
    # 查找用户
    result = await db.execute(
        select(User).where(User.username == user_data.username)
    )
    user = result.scalar_one_or_none()

    # 验证用户和密码
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 生成 JWT Token
    access_token = create_access_token(
        data={"sub": str(user.user_id), "username": user.username},
        secret_key=SECRET_KEY,
        algorithm=ALGORITHM,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@app.get("/me", response_model=UserResponse, tags=["Auth"])
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    获取当前用户信息

    需要在 Header 中提供 Authorization: Bearer <token>
    """
    return UserResponse.model_validate(current_user)


@app.post("/refresh", response_model=Token, tags=["Auth"])
async def refresh_token(
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    刷新 Token

    需要在 Header 中提供有效的 Token
    """
    access_token = create_access_token(
        data={"sub": str(current_user.user_id), "username": current_user.username},
        secret_key=SECRET_KEY,
        algorithm=ALGORITHM,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return Token(
        access_token=access_token,
        user=UserResponse.model_validate(current_user)
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
