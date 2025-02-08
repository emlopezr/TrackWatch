package com.trackify.backend.controller

import com.trackify.backend.controller.dto.UserResponseDTO
import com.trackify.backend.service.UserService
import com.trackify.backend.utils.values.Endpoints
import com.trackify.backend.utils.values.Metrics
import com.trackify.backend.utils.values.Headers
import com.trackify.backend.utils.service.MetricService
import org.springframework.http.HttpStatus

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(Endpoints.USER_CONTROLLER_BASE)
class UserController(
    private val userService: UserService,
    metricService: MetricService
): BaseController(metricService) {

    @PostMapping(Endpoints.USER_CONTROLLER_REGISTER)
    fun registerUser(
        @RequestHeader(Headers.ACCESS_TOKEN)  accessToken: String,
        @RequestHeader(Headers.REFRESH_TOKEN) refreshToken: String
    ): ResponseEntity<UserResponseDTO> {
        sendMetricRequest(Endpoints.USER_CONTROLLER_REGISTER, "POST")
        val response = userService.registerUser(accessToken, refreshToken)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @GetMapping(Endpoints.USER_CONTROLLER_GET_BY_ID)
    fun getCurrentUser(
        @RequestHeader(Headers.ACCESS_TOKEN)  accessToken: String,
        @RequestHeader(Headers.REFRESH_TOKEN) refreshToken: String
    ): ResponseEntity<UserResponseDTO> {
        sendMetricRequest(Endpoints.USER_CONTROLLER_GET_BY_ID, "GET")
        val response = userService.getCurrentUser(accessToken, refreshToken)
        return ResponseEntity.ok(response)
    }

}