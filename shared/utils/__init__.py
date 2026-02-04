"""
工具函数模块

包含:
- auth: 认证相关工具(JWT, 密码哈希, 用户验证)
- response: 统一响应格式

注意：不自动导入 auth 模块，避免依赖污染
需要 auth 函数的服务应使用: from shared.utils.auth import ...
"""

# 只导入不依赖数据库/认证的模块
from shared.utils.response import success_response, error_response

# auth 模块需要时手动导入，避免自动导入导致依赖问题
# from shared.utils.auth import ...

__all__ = [
    "success_response",
    "error_response",
]
