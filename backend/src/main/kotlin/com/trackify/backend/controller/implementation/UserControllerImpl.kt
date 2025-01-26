package com.trackify.backend.controller.implementation

import com.trackify.backend.controller.contract.UserController
import com.trackify.backend.model.dto.UserResponseDTO
import com.trackify.backend.service.implementation.UserServiceImpl

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

// TODO: Use interface for userService
@RestController
@RequestMapping("/users")
class UserControllerImpl(private val userService: UserServiceImpl): UserController {

    @PostMapping("/register")
    override fun registerUser(
        @RequestHeader("X-Spotify-Access-Token")  spotifyAccessToken: String,
        @RequestHeader("X-Spotify-Refresh-Token") spotifyRefreshToken: String
    ): ResponseEntity<UserResponseDTO> {
        return try {
            val response = userService.registerUser(spotifyAccessToken, spotifyRefreshToken)
            ResponseEntity.ok(response)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    // TODO: Exception handling - Maybe have a class that handles all exceptions
    // TODO: Authentication - Only if auth token is from the user itself or admin
    @GetMapping("/{id}")
    override fun getUserById(@PathVariable id: String): ResponseEntity<UserResponseDTO> {
        try {
            val response = userService.getUserById(id)
            return ResponseEntity.ok(response)
        } catch (e: Exception) {
            return ResponseEntity.notFound().build()
        }
    }

}