package com.trackify.backend.controller.contract

import com.trackify.backend.model.dto.UserResponseDTO
import org.springframework.http.ResponseEntity

interface UserController {
    fun registerUser(spotifyAccessToken: String, spotifyRefreshToken: String): ResponseEntity<UserResponseDTO>
    fun getUserById(id: String): ResponseEntity<UserResponseDTO>
}