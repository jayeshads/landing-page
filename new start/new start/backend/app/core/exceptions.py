"""
LeadPilot — Custom exception classes.
"""
from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base for all LeadPilot-specific HTTP exceptions."""
    def __init__(self, status_code: int, detail: str, headers: dict | None = None):
        super().__init__(status_code=status_code, detail=detail, headers=headers)


class NotFoundError(AppException):
    def __init__(self, resource: str = "Resource"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=f"{resource} not found")


class ConflictError(AppException):
    def __init__(self, detail: str = "Resource already exists"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class ForbiddenError(AppException):
    def __init__(self, detail: str = "You don't have permission to do this"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


class BadRequestError(AppException):
    def __init__(self, detail: str = "Invalid request"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class UnauthorizedError(AppException):
    def __init__(self, detail: str = "Not authenticated"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )


class RateLimitError(AppException):
    def __init__(self, retry_after: int = 60):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
            headers={"Retry-After": str(retry_after)},
        )


class MetaAPIError(AppException):
    """Raised when Meta Graph API returns an error."""
    def __init__(self, detail: str = "Meta API error", meta_error_code: int | None = None):
        self.meta_error_code = meta_error_code
        super().__init__(status_code=status.HTTP_502_BAD_GATEWAY, detail=detail)


class AIServiceError(AppException):
    """Raised when an AI provider (OpenAI/Claude/Gemini) fails."""
    def __init__(self, detail: str = "AI service temporarily unavailable"):
        super().__init__(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=detail)


class InsufficientCreditsError(AppException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient credits. Please upgrade your plan.",
        )
