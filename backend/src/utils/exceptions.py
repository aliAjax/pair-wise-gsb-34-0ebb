from src.constants.error_messages import ERROR_MESSAGES


class ServiceError(Exception):
    """业务异常：service 层抛出，controller/全局处理器统一包装。"""

    def __init__(self, code: str, status_code: int = 400, message: str | None = None):
        self.code = code
        self.status_code = status_code
        super().__init__(message or ERROR_MESSAGES.get(code, code))
