package com.trackify.backend.controller.implementation

import com.trackify.backend.controller.contract.UserController
import com.trackify.backend.service.contract.UserService
import com.trackify.backend.model.dto.UserResponseDTO
import com.trackify.backend.utils.Endpoints
import com.trackify.backend.utils.Headers

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(Endpoints.USER_CONTROLLER_BASE)
class UserControllerImpl(private val userService: UserService): UserController {

    @PostMapping(Endpoints.USER_CONTROLLER_REGISTER)
    override fun registerUser(
        @RequestHeader(Headers.ACCESS_TOKEN)  accessToken: String,
        @RequestHeader(Headers.REFRESH_TOKEN) refreshToken: String
    ): ResponseEntity<UserResponseDTO> {
        return try {
            val response = userService.registerUser(accessToken, refreshToken)
            ResponseEntity.ok(response)
        } catch (e: Exception) {
            ResponseEntity.badRequest().build()
        }
    }

    // TODO: Exception handling - Maybe have a class that handles all exceptions
    // TODO: Authentication - Only if auth token is from the user itself or admin
    @GetMapping(Endpoints.USER_CONTROLLER_GET_BY_ID)
    override fun getUserById(
        @PathVariable userId: String,
        @RequestHeader(Headers.ACCESS_TOKEN)  accessToken: String,
        @RequestHeader(Headers.REFRESH_TOKEN) refreshToken: String
    ): ResponseEntity<UserResponseDTO> {
        try {
            val response = userService.getUserById(userId, accessToken, refreshToken)
            return ResponseEntity.ok(response)
        } catch (e: Exception) {
            return ResponseEntity.notFound().build()
        }
    }

}