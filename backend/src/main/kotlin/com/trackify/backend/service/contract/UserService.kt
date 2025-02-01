package com.trackify.backend.service.contract

import com.trackify.backend.model.dto.UserResponseDTO

interface UserService {
    fun registerUser(accessToken: String, refreshToken: String): UserResponseDTO
    fun getCurrentUser(accessToken: String, refreshToken: String, userId: String?): UserResponseDTO
}