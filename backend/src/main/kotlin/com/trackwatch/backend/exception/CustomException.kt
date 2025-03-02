package com.trackwatch.backend.exception

import com.trackwatch.backend.utils.values.ErrorCode

open class CustomException(val errorCode: ErrorCode, message: String = errorCode.description, val details: String = "") : RuntimeException(message)

class BadRequestException(errorCode: ErrorCode, message: String = errorCode.description, details: String = "") : CustomException(errorCode, message, details)
class UnauthorizedException(errorCode: ErrorCode, message: String = errorCode.description, details: String = "") : CustomException(errorCode, message, details)
class ForbiddenException(errorCode: ErrorCode, message: String = errorCode.description, details: String = "") : CustomException(errorCode, message, details)
class NotFoundException(errorCode: ErrorCode, message: String = errorCode.description, details: String = "") : CustomException(errorCode, message, details)
class InternalServerErrorException(errorCode: ErrorCode, message: String = errorCode.description, details: String = "") : CustomException(errorCode, message, details)