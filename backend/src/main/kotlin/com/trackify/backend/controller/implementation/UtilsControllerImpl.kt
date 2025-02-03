package com.trackify.backend.controller.implementation

import com.trackify.backend.controller.contract.UtilsController
import com.trackify.backend.scheluded.ScheduledService
import com.trackify.backend.utils.ApiEndpoint
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class UtilsControllerImpl(
    private val scheduledService: ScheduledService
): UtilsController {

    @GetMapping(ApiEndpoint.PING)
    override fun ping(): ResponseEntity<String> {
        return ResponseEntity.ok("pong")
    }

    @PostMapping(ApiEndpoint.RUN_CORE_TASK)
    override fun run(): ResponseEntity<String> {
        scheduledService.runCoreTask()
        return ResponseEntity.ok("Task executed")
    }

}