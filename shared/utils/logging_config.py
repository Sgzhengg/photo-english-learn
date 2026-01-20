"""
统一日志配置模块
提供结构化日志，方便调试和监控
"""
import logging
import sys
from datetime import datetime
from typing import Any
import json
import os


class JSONFormatter(logging.Formatter):
    """JSON 格式化器（用于生产环境）"""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # 添加异常信息
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # 添加额外字段
        if hasattr(record, 'user_id'):
            log_data["user_id"] = record.user_id
        if hasattr(record, 'request_id'):
            log_data["request_id"] = record.request_id
        if hasattr(record, 'service'):
            log_data["service"] = record.service

        return json.dumps(log_data, ensure_ascii=False)


class ColoredFormatter(logging.Formatter):
    """彩色控制台格式化器（用于开发环境）"""

    # ANSI 颜色代码
    COLORS = {
        'DEBUG': '\033[36m',      # 青色
        'INFO': '\033[32m',       # 绿色
        'WARNING': '\033[33m',    # 黄色
        'ERROR': '\033[31m',      # 红色
        'CRITICAL': '\033[35m',   # 紫色
        'RESET': '\033[0m',       # 重置
    }

    def format(self, record: logging.LogRecord) -> str:
        levelcolor = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        reset = self.COLORS['RESET']

        # 格式：[时间] [级别] [模块] 消息
        timestamp = datetime.now().strftime('%H:%M:%S')
        levelname = record.levelname.ljust(8)
        module = record.name

        message = f"{levelcolor}[{timestamp}] [{levelname}] [{module}]{reset} {record.getMessage()}"

        # 添加异常信息
        if record.exc_info:
            message += '\n' + self.formatException(record.exc_info)

        return message


def setup_logging(
    service_name: str,
    level: str = None,
    json_output: bool = None
):
    """
    配置日志系统

    Args:
        service_name: 服务名称（如 auth-service, vision-service）
        level: 日志级别（DEBUG, INFO, WARNING, ERROR, CRITICAL）
        json_output: 是否使用 JSON 格式输出（生产环境）
    """
    # 从环境变量获取配置
    if level is None:
        level = os.getenv("LOG_LEVEL", "INFO").upper()

    if json_output is None:
        json_output = os.getenv("LOG_JSON", "false").lower() == "true"

    # 根环境选择格式化器
    if json_output:
        formatter = JSONFormatter()
    else:
        formatter = ColoredFormatter()

    # 配置根日志记录器
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level))

    # 移除现有的处理器
    root_logger.handlers.clear()

    # 添加控制台处理器
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(getattr(logging, level))
    root_logger.addHandler(console_handler)

    # 配置特定日志记录器
    # UVicorn 日志
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

    # SQLAlchemy 日志
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)

    # HTTPx 日志
    logging.getLogger("httpx").setLevel(logging.WARNING)

    # OpenAI 日志
    logging.getLogger("openai").setLevel(logging.WARNING)

    # 添加服务名称到上下文
    logging.root.service_name = service_name

    logging.info(f"{service_name} 日志系统已初始化 (级别: {level}, JSON: {json_output})")


def get_logger(name: str) -> logging.Logger:
    """
    获取日志记录器

    Args:
        name: 日志记录器名称（通常使用 __name__）

    Returns:
        配置好的日志记录器

    Example:
        from shared.utils.logging_config import get_logger
        logger = get_logger(__name__)
        logger.info("这是一条日志")
    """
    return logging.getLogger(name)


# 日志上下文管理器
class LogContext:
    """日志上下文管理器，用于添加额外的上下文信息"""

    def __init__(self, **kwargs):
        self.context = kwargs
        self.old_factory = None

    def __enter__(self):
        self.old_factory = logging.getLogRecordFactory()

        def record_factory(*args, **kwargs):
            record = self.old_factory(*args, **kwargs)
            for key, value in self.context.items():
                setattr(record, key, value)
            return record

        logging.setLogRecordFactory(record_factory)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        logging.setLogRecordFactory(self.old_factory)


# 便捷函数
def log_request(logger: logging.Logger, request_data: dict):
    """记录请求数据"""
    logger.info(f"请求: {request_data}")


def log_response(logger: logging.Logger, response_data: dict, duration_ms: float = None):
    """记录响应数据"""
    if duration_ms:
        logger.info(f"响应: {response_data} (耗时: {duration_ms:.2f}ms)")
    else:
        logger.info(f"响应: {response_data}")


def log_error(logger: logging.Logger, error: Exception, context: dict = None):
    """记录错误"""
    logger.error(f"错误: {str(error)}", exc_info=error)

    if context:
        logger.debug(f"错误上下文: {context}")


def log_api_call(
    logger: logging.Logger,
    endpoint: str,
    method: str,
    user_id: int = None,
    duration_ms: float = None,
    success: bool = True
):
    """记录 API 调用"""
    log_data = {
        "endpoint": endpoint,
        "method": method,
        "success": success
    }

    if user_id:
        log_data["user_id"] = user_id

    if duration_ms is not None:
        log_data["duration_ms"] = round(duration_ms, 2)

    if success:
        logger.info(f"API调用: {log_data}")
    else:
        logger.warning(f"API调用失败: {log_data}")
