from src.constants.error_codes import ERROR_CODES
from src.constants.error_messages import ERROR_MESSAGES


class BizError(Exception):
    """业务异常：service 层抛出，controller 层包装为 HTTP 响应。"""

    def __init__(self, code: str, message: str | None = None, status_code: int = 400):
        self.code = code if code in ERROR_CODES else ERROR_CODES["INTERNAL_ERROR"]
        self.message = message or ERROR_MESSAGES.get(self.code, ERROR_MESSAGES["INTERNAL_ERROR"])
        self.status_code = status_code
        super().__init__(self.message)


def not_found(message: str | None = None) -> BizError:
    return BizError(ERROR_CODES["NOT_FOUND"], message, 404)


def state_conflict(message: str | None = None) -> BizError:
    return BizError(ERROR_CODES["STATE_CONFLICT"], message, 409)


def validation_failed(message: str | None = None) -> BizError:
    return BizError(ERROR_CODES["VALIDATION_FAILED"], message, 422)
