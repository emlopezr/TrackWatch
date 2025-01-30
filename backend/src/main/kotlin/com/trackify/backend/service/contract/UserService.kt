package com.trackify.backend.service.contract

import com.trackify.backend.model.dto.UserResponseDTO

interface UserService {
    fun registerUser(accessToken: String, refreshToken: String): UserResponseDTO
    fun getUserById(userId: String, accessToken: String, refreshToken: String): UserResponseDTO
}