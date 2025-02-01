package com.trackify.backend.controller.contract

import com.trackify.backend.model.dto.UserResponseDTO
import org.springframework.http.ResponseEntity

interface UserController {
    fun registerUser(accessToken: String, refreshToken: String): ResponseEntity<UserResponseDTO>
    fun getCurrentUser(accessToken: String, refreshToken: String): ResponseEntity<UserResponseDTO>
}