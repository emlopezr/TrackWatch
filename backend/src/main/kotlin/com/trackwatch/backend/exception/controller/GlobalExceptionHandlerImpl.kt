package com.trackwatch.backend.exception.controller

import com.trackwatch.backend.exception.*
import com.trackwatch.backend.exception.controller.dto.ExceptionResponseDTO
import com.trackwatch.backend.utils.service.MetricService
import com.trackwatch.backend.utils.values.Metrics

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler(private val metricService: MetricService) {

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

        sendMetricException(response)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response)
    }

    private fun buildErrorResponse(httpStatus: HttpStatus, exception: CustomException): ResponseEntity<ExceptionResponseDTO> {
        val response = ExceptionResponseDTO(
            status = httpStatus.value(),
            code = exception.errorCode.name,
            message = exception.message ?: "",
            details = exception.details
        )

        sendMetricException(response)
        return ResponseEntity.status(httpStatus).body(response)
    }

    protected fun sendMetricException(exception: ExceptionResponseDTO) {
        metricService.incrementCounter(
            Metrics.EXCEPTION,
            "status", exception.status.toString(),
            "code", exception.code
        )
    }
}