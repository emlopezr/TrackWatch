package com.trackwatch.backend.exception.controller.dto

data class ExceptionResponseDTO(
    val status: Int,
    val code: String,
    val message: String,
    val details: String
)
