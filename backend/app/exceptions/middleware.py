from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin

from .exceptions import *

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
      details = str(exception)
      response = exception_response_dto(status, code, message, details)
      return JsonResponse(response, status=status)

    code = exception.error_code[0]
    message = exception.message
    details = exception.details
    response = exception_response_dto(status, code, message, details)

    print(f"response: {response}")
    return JsonResponse(response, status=status)