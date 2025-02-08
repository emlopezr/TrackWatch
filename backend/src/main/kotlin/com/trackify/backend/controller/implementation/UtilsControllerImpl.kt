package com.trackify.backend.controller.implementation

import com.trackify.backend.controller.contract.UtilsController
import com.trackify.backend.exception.UnauthorizedException
import com.trackify.backend.scheluded.ScheduledService
import com.trackify.backend.utils.*
import io.micrometer.core.instrument.MeterRegistry
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RestController

@RestController
class UtilsControllerImpl(
    private val metricService: MetricService,
    private val scheduledService: ScheduledService
): UtilsController {

    @GetMapping(ApiEndpoint.PING)
    override fun ping(): ResponseEntity<String> {

        metricService.incrementCounter(ApiMetric.REST_REQUEST,
            "controller", "UtilsController",
            "endpoint", ApiEndpoint.PING,
            "method", "GET"
        )

        return ResponseEntity.ok("pong")
    }

    @PostMapping(ApiEndpoint.RUN_CORE_TASK)
    override fun run(
        @RequestHeader(CustomHeader.ADMIN_KEY) adminKey: String
    ): ResponseEntity<String> {

        metricService.incrementCounter(ApiMetric.REST_REQUEST,
            "controller", "UtilsController",
            "endpoint", ApiEndpoint.RUN_CORE_TASK,
            "method", "POST"
        )

        checkAdminKey(adminKey)
        scheduledService.runCoreTask()
        return ResponseEntity.ok("Task executed")
    }

    private fun checkAdminKey(adminKey: String) {
        if (adminKey != System.getenv("ADMIN_KEY")) {
            throw UnauthorizedException(ErrorCode.INVALID_ADMIN_CREDENTIALS, "Invalid admin credentials")
        }
    }

}