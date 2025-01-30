package com.trackify.backend.exception.controller

import com.trackify.backend.exception.*
import com.trackify.backend.exception.controller.dto.ExceptionResponseDTO

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {

    @ExceptionHandler(BadRequestException::class)
    fun handleBadRequestException(exception: BadRequestException): ResponseEntity<ExceptionResponseDTO> {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, exception)
    }

    @ExceptionHandler(UnauthorizedException::class)
    fun handleUnauthorizedException(exception: UnauthorizedException): ResponseEntity<ExceptionResponseDTO> {
        return buildErrorResponse(HttpStatus.UNAUTHORIZED, exception)
    }

    @ExceptionHandler(ForbiddenException::class)
    fun handleForbiddenException(exception: ForbiddenException): ResponseEntity<ExceptionResponseDTO> {
        return buildErrorResponse(HttpStatus.FORBIDDEN, exception)
    }

    @ExceptionHandler(NotFoundException::class)
    fun handleNotFoundException(exception: NotFoundException): ResponseEntity<ExceptionResponseDTO> {
        return buildErrorResponse(HttpStatus.NOT_FOUND, exception)
    }

    @ExceptionHandler(InternalServerErrorException::class)
    fun handleInternalServerErrorException(exception: InternalServerErrorException): ResponseEntity<ExceptionResponseDTO> {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, exception)
    }

    @ExceptionHandler(Exception::class)
    fun handleGenericException(exception: Exception): ResponseEntity<ExceptionResponseDTO> {
        val response = ExceptionResponseDTO(
            status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
            code = HttpStatus.INTERNAL_SERVER_ERROR.name,
            message = "Internal server error",
            details = exception.message ?: ""
        )

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response)
    }

    private fun buildErrorResponse(httpStatus: HttpStatus, exception: CustomException): ResponseEntity<ExceptionResponseDTO> {
        val response = ExceptionResponseDTO(
            status = httpStatus.value(),
            code = exception.errorCode.name,
            message = exception.message ?: "",
            details = exception.details
        )

        return ResponseEntity.status(httpStatus).body(response)
    }
}