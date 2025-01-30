package com.trackify.backend.controller.implementation

import com.trackify.backend.controller.contract.UtilsController
import com.trackify.backend.utils.ApiEndpoint
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class UtilsControllerImpl: UtilsController {

    @GetMapping(ApiEndpoint.PING)
    override fun ping(): ResponseEntity<String> {
        return ResponseEntity.ok("pong")
    }

}