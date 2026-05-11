import logging

from django.conf import settings
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

from .exceptions import *

logger = logging.getLogger(__name__)


def _log_exception(message, request, code, exception):
  logger.error(
    "%s %s %s [%s]",
    message,
    request.method,
    request.path,
    code,
    exc_info=(type(exception), exception, exception.__traceback__),
  )

class GlobalExceptionMiddleware(MiddlewareMixin):
  def process_exception(self, request, exception):
    if isinstance(exception, BadRequestException): status = 400
    elif isinstance(exception, UnauthorizedException): status = 401
    elif isinstance(exception, ForbiddenException): status = 403
    elif isinstance(exception, NotFoundException): status = 404
    elif isinstance(exception, InternalServerErrorException): status = 500
    elif isinstance(exception, CustomException): status = 500
    else:
      status = 500
      code = ErrorCode.UNHANDLED_EXCEPTION[0]
      message = ErrorCode.UNHANDLED_EXCEPTION[1]
      details = str(exception) if settings.DEBUG else ""
      _log_exception("Unhandled exception while processing", request, code, exception)
      response = exception_response_dto(status, code, message, details)
      return JsonResponse(response, status=status)

    code = exception.error_code[0]
    message = exception.message
    details = exception.details if status < 500 or settings.DEBUG else ""
    if status >= 500:
      _log_exception("Application error while processing", request, code, exception)
    response = exception_response_dto(status, code, message, details)

    return JsonResponse(response, status=status)
