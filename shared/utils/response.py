"""
统一响应格式工具
"""
from typing import Any, Optional, TypeVar, Generic
from pydantic import BaseModel
from fastapi import status
from fastapi.responses import JSONResponse


T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """统一响应模型"""
    code: int = 0
    message: str = "success"
    data: Optional[T] = None


def success_response(
    data: Any = None,
    message: str = "success",
    code: int = 0
) -> dict:
    """成功响应"""
    return {
        "code": code,
        "message": message,
        "data": data
    }


def error_response(
    message: str = "error",
    code: int = -1,
    data: Any = None
) -> dict:
    """错误响应"""
    return {
        "code": code,
        "message": message,
        "data": data
    }


class JSONResponseWithCode(JSONResponse):
    """带状态码的 JSON 响应"""
    def __init__(
        self,
        content: dict,
        status_code: int = status.HTTP_200_OK,
        **kwargs
    ):
        super().__init__(content=content, status_code=status_code, **kwargs)
