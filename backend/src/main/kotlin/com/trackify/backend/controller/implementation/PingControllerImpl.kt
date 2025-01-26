package com.trackify.backend.controller.implementation

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class PingControllerImpl {

    @GetMapping("/ping")
    fun ping(): String {
        return "pong"
    }

}