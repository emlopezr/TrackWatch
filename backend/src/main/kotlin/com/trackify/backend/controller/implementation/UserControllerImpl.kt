package com.trackify.backend.controller.implementation

import com.trackify.backend.controller.contract.UserController
import com.trackify.backend.service.contract.UserService
import com.trackify.backend.model.dto.UserResponseDTO
import com.trackify.backend.utils.ApiEndpoint
import com.trackify.backend.utils.CustomHeader
import org.springframework.http.HttpStatus

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(ApiEndpoint.USER_CONTROLLER_BASE)
class UserControllerImpl(private val userService: UserService): UserController {

    // TODO: Add access token validation
    @PostMapping(ApiEndpoint.USER_CONTROLLER_REGISTER)
    override fun registerUser(
        @RequestHeader(CustomHeader.ACCESS_TOKEN)  accessToken: String,
        @RequestHeader(CustomHeader.REFRESH_TOKEN) refreshToken: String
    ): ResponseEntity<UserResponseDTO> {
        val response = userService.registerUser(accessToken, refreshToken)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    // TODO: Add access token validation
    @GetMapping(ApiEndpoint.USER_CONTROLLER_GET_BY_ID)
    override fun getCurrentUser(
        @RequestHeader(CustomHeader.ACCESS_TOKEN)  accessToken: String,
        @RequestHeader(CustomHeader.REFRESH_TOKEN) refreshToken: String
    ): ResponseEntity<UserResponseDTO> {
        val response = userService.getCurrentUser(accessToken, refreshToken)
        return ResponseEntity.ok(response)
    }

}