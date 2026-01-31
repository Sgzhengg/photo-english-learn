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
from shared.utils.rate_limit import limit_auth

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


@app.get("/health", tags=["Health"])
async def health():
    """健康检查 - 详细状态"""
    return {"status": "ok", "service": "auth"}


@app.post("/send-code", tags=["Auth"])
@limit_auth(max_requests=10, window_seconds=60)  # 发送验证码限流：10 次/分钟
async def send_verification_code(
    request_data: dict,
    db: AsyncSession = Depends(get_async_db)
):
    """
    发送验证码（开发模式：接受任何 6 位数字）

    - **emailOrPhone**: 邮箱或手机号

    生产环境应该：
    - 发送真实的邮件/短信验证码
    - 验证码有效期 5-10 分钟
    - 限制发送频率（例如 60 秒内只能发送一次）

    开发模式：任何 6 位数字都被视为有效验证码
    """
    import logging
    import random
    logger = logging.getLogger(__name__)

    email_or_phone = request_data.get("emailOrPhone")

    if not email_or_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="请提供邮箱或手机号"
        )

    # 开发模式：直接返回成功，不发送真实验证码
    logger.info(f"发送验证码到: {email_or_phone} (开发模式)")

    # TODO: 生产环境应该集成真实的邮件/短信服务
    # verification_code = str(random.randint(100000, 999999))
    # await send_email_or_sms(email_or_phone, verification_code)

    return success_response(data={
        "message": "验证码已发送",
        "emailOrPhone": email_or_phone,
        "note": "开发模式：任何 6 位数字都是有效验证码"
    })


@app.post("/register", tags=["Auth"])
@limit_auth(max_requests=10, window_seconds=60)  # 注册限流：10 次/分钟
async def register(
    request_data: dict,
    db: AsyncSession = Depends(get_async_db)
):
    """
    用户注册

    - **emailOrPhone**: 邮箱或手机号（用作 username 和 email）
    - **verificationCode**: 验证码（开发模式：任何 6 位数字都有效）
    - **password**: 密码

    限流：每个 IP 每分钟最多 10 次注册请求
    """
    import logging
    logger = logging.getLogger(__name__)

    # 从请求中提取数据
    email_or_phone = request_data.get("emailOrPhone")
    verification_code = request_data.get("verificationCode")
    password = request_data.get("password")

    # 验证必填字段
    if not all([email_or_phone, password]):
        return success_response(
            code=-1,
            message="请提供邮箱和密码",
            data=None
        )

    # 开发模式：不验证验证码
    # 生产环境应该验证验证码是否正确
    if not verification_code:
        return success_response(
            code=-1,
            message="请提供验证码",
            data=None
        )

    # 验证密码长度（bcrypt哈希后的密码不能超过72字节）
    password_bytes = len(password.encode('utf-8'))
    if password_bytes > 72:
        logger.error(f"注册失败: 密码过长 ({password_bytes} 字节)")
        return success_response(
            code=-1,
            message=f"密码长度不能超过72字节（当前：{password_bytes}字节）",
            data=None
        )

    # 生成用户名（使用 email 的 @ 前部分）
    if "@" in email_or_phone:
        username = email_or_phone.split("@")[0]
        email = email_or_phone
    else:
        # 如果是手机号，使用手机号作为 username 和 email
        username = email_or_phone
        email = email_or_phone

    # 检查用户名是否已存在
    result = await db.execute(select(User).where(User.username == username))
    if result.scalar_one_or_none():
        # 如果用户名存在，添加随机后缀
        import random
        import string
        suffix = ''.join(random.choices(string.ascii_lowercase, k=4))
        username = f"{username}_{suffix}"

    # 检查邮箱是否已存在
    result = await db.execute(select(User).where(User.email == email))
    if result.scalar_one_or_none():
        logger.error(f"注册失败: 邮箱已被注册 ({email})")
        return success_response(
            code=-1,
            message="邮箱已被注册",
            data=None
        )

    logger.info(f"开始注册用户: {username}, {email}")

    # 创建新用户
    new_user = User(
        username=username,
        email=email,
        nickname=username,
        password_hash=hash_password(password)
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

    return success_response(data={
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(new_user).model_dump()
    })


@app.post("/login", tags=["Auth"])
@limit_auth(max_requests=20, window_seconds=60)  # 登录限流：20 次/分钟
async def login(
    user_data: UserLogin,
    db: AsyncSession = Depends(get_async_db)
):
    """
    用户登录

    - **username**: 用户名
    - **password**: 密码

    限流：每个 IP 每分钟最多 20 次登录请求
    """
    # 查找用户
    result = await db.execute(
        select(User).where(User.username == user_data.username)
    )
    user = result.scalar_one_or_none()

    # 验证用户和密码
    if not user or not verify_password(user_data.password, user.password_hash):
        return success_response(
            code=-1,
            message="用户名或密码错误",
            data=None
        )

    # 生成 JWT Token
    access_token = create_access_token(
        data={"sub": str(user.user_id), "username": user.username},
        secret_key=SECRET_KEY,
        algorithm=ALGORITHM,
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return success_response(data={
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user).model_dump()
    })


@app.get("/me", tags=["Auth"])
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    获取当前用户信息

    需要在 Header 中提供 Authorization: Bearer <token>
    """
    return success_response(data=UserResponse.model_validate(current_user).model_dump())


@app.post("/refresh", tags=["Auth"])
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

    return success_response(data={
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(current_user).model_dump()
    })


@app.post("/reset-password", tags=["Auth"])
async def reset_password(
    request_data: dict,
    db: AsyncSession = Depends(get_async_db)
):
    """
    重置密码

    - **emailOrPhone**: 邮箱或手机号
    - **verificationCode**: 验证码
    - **newPassword**: 新密码

    开发模式：任何 6 位数字验证码都被视为有效
    """
    import logging
    logger = logging.getLogger(__name__)

    email_or_phone = request_data.get("emailOrPhone")
    verification_code = request_data.get("verificationCode")
    new_password = request_data.get("newPassword")

    if not all([email_or_phone, verification_code, new_password]):
        return success_response(
            code=-1,
            message="请提供邮箱、验证码和新密码",
            data=None
        )

    # 开发模式：不验证验证码格式（任何 6 位数字都有效）
    # 生产环境应该验证验证码是否正确
    logger.info(f"重置密码: {email_or_phone} (开发模式)")

    # 查找用户
    from sqlalchemy import select
    result = await db.execute(
        select(User).where(User.email == email_or_phone)
    )
    user = result.scalar_one_or_none()

    if not user:
        logger.error(f"重置密码失败: 用户不存在 ({email_or_phone})")
        return success_response(
            code=-1,
            message="用户不存在",
            data=None
        )

    # 验证密码长度
    password_bytes = len(new_password.encode('utf-8'))
    if password_bytes > 72:
        return success_response(
            code=-1,
            message="密码长度不能超过72字节",
            data=None
        )

    # 更新密码
    user.password_hash = hash_password(new_password)
    await db.commit()
    await db.refresh(user)

    logger.info(f"密码重置成功: {email_or_phone}")

    return success_response(data={
        "message": "密码重置成功",
        "emailOrPhone": email_or_phone
    })


@app.post("/logout", tags=["Auth"])
async def logout():
    """
    用户登出

    实际上 JWT 是无状态的，客户端删除 token 即可
    这个端点主要用于：
    - 记录登出日志
    - 可选：将 token 加入黑名单（如果需要实现强制登出功能）
    """
    import logging
    logger = logging.getLogger(__name__)

    logger.info("用户登出")

    return success_response(data={
        "message": "登出成功"
    })


# 用户相关端点
@app.get("/user/me", tags=["User"])
async def get_user_me(
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    获取当前用户信息

    需要在 Header 中提供 Authorization: Bearer <token>
    """
    return success_response(data=UserResponse.model_validate(current_user).model_dump())


@app.patch("/user/preferences", tags=["User"])
async def update_user_preferences(
    request_data: dict,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db)
):
    """
    更新用户偏好设置（注册后引导）

    - **englishLevel**: 英语水平
    - **dailyGoal**: 每日目标
    """
    import logging
    logger = logging.getLogger(__name__)

    english_level = request_data.get("englishLevel")
    daily_goal = request_data.get("dailyGoal")

    # TODO: 实际应用中应该保存到用户配置表
    logger.info(f"更新用户偏好: {current_user.username}, englishLevel={english_level}, dailyGoal={daily_goal}")

    return success_response(data={
        "message": "偏好设置已更新",
        "englishLevel": english_level,
        "dailyGoal": daily_goal
    })


@app.patch("/user/profile", tags=["User"])
async def update_user_profile(
    request_data: dict,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db)
):
    """
    更新用户资料

    - **nickname**: 昵称
    - **avatar**: 头像 URL
    """
    import logging
    logger = logging.getLogger(__name__)

    nickname = request_data.get("nickname")
    avatar = request_data.get("avatar")

    if nickname:
        current_user.nickname = nickname
    if avatar:
        current_user.avatar_url = avatar

    await db.commit()
    await db.refresh(current_user)

    logger.info(f"更新用户资料: {current_user.username}")

    return success_response(data={
        "message": "资料更新成功",
        "user": UserResponse.model_validate(current_user).model_dump()
    })


@app.post("/user/change-password", tags=["User"])
async def change_password(
    request_data: dict,
    current_user: Annotated[User, Depends(get_current_user)],
    db: AsyncSession = Depends(get_async_db)
):
    """
    修改密码

    - **currentPassword**: 当前密码
    - **newPassword**: 新密码
    """
    import logging
    logger = logging.getLogger(__name__)

    current_password = request_data.get("currentPassword")
    new_password = request_data.get("newPassword")

    if not all([current_password, new_password]):
        return success_response(
            code=-1,
            message="请提供当前密码和新密码",
            data=None
        )

    # 验证当前密码
    if not verify_password(current_password, current_user.password_hash):
        return success_response(
            code=-1,
            message="当前密码错误",
            data=None
        )

    # 验证新密码长度
    password_bytes = len(new_password.encode('utf-8'))
    if password_bytes > 72:
        return success_response(
            code=-1,
            message=f"密码长度不能超过72字节（当前：{password_bytes}字节）",
            data=None
        )

    # 更新密码
    current_user.password_hash = hash_password(new_password)
    await db.commit()

    logger.info(f"用户修改密码: {current_user.username}")

    return success_response(data={
        "message": "密码修改成功"
    })


# =============================================================================
# 临时开发端点 - 仅用于测试，生产环境必须删除！
# =============================================================================

@app.delete("/dev/clear-user", tags=["Dev"])
async def clear_user_by_email(
    request_data: dict,
    db: AsyncSession = Depends(get_async_db)
):
    """
    [临时开发端点] 根据邮箱删除用户

    ⚠️ 警告：此端点仅用于开发/测试环境，生产环境必须删除！
    """
    import logging
    logger = logging.getLogger(__name__)

    email = request_data.get("email")

    if not email:
        return success_response(
            code=-1,
            message="请提供邮箱地址",
            data=None
        )

    # 查找用户
    from sqlalchemy import select, delete
    result = await db.execute(
        select(User).where(User.email == email)
    )
    user = result.scalar_one_or_none()

    if not user:
        return success_response(
            code=-1,
            message=f"用户不存在: {email}",
            data=None
        )

    # 删除用户
    await db.execute(
        delete(User).where(User.email == email)
    )
    await db.commit()

    logger.warning(f"[开发端点] 已删除用户: {email} (user_id: {user.user_id})")

    return success_response(data={
        "message": f"用户已删除: {email}",
        "user_id": user.user_id,
        "username": user.username
    })


@app.get("/dev/list-users", tags=["Dev"])
async def list_all_users(
    db: AsyncSession = Depends(get_async_db)
):
    """
    [临时开发端点] 列出所有用户

    ⚠️ 警告：此端点仅用于开发/测试环境，生产环境必须删除！
    """
    import logging
    logger = logging.getLogger(__name__)

    from sqlalchemy import select
    result = await db.execute(
        select(User).order_by(User.created_at.desc())
    )
    users = result.scalars().all()

    users_list = [
        {
            "user_id": u.user_id,
            "username": u.username,
            "email": u.email,
            "nickname": u.nickname,
            "created_at": u.created_at.isoformat() if u.created_at else None
        }
        for u in users
    ]

    return success_response(data={
        "total": len(users_list),
        "users": users_list
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
