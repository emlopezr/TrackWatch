package com.trackify.backend.controller

import com.trackify.backend.exception.UnauthorizedException
import com.trackify.backend.scheluded.ScheduledService
import com.trackify.backend.utils.service.MetricService
import com.trackify.backend.utils.values.Constants
import com.trackify.backend.utils.values.Endpoints
import com.trackify.backend.utils.values.Headers
import com.trackify.backend.utils.values.ErrorCode
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class UtilsController(
    private val scheduledService: ScheduledService,
    metricService: MetricService
): BaseController(metricService) {

    @GetMapping(Endpoints.PING)
    fun ping(): ResponseEntity<String> {
        sendMetricRequest(Endpoints.PING, "GET")
        return ResponseEntity.ok("pong")
    }

    @PostMapping(Endpoints.RUN_CORE_TASK)
    fun run(
        @RequestHeader(Headers.ADMIN_KEY) adminKey: String,
        @RequestParam("daysLimit", required = false) daysLimit: Int?
    ): ResponseEntity<String> {
        sendMetricRequest(Endpoints.RUN_CORE_TASK, "POST")
        checkAdminKey(adminKey)
        scheduledService.runCoreTask(daysLimit ?: Constants.DAYS_LIMIT)
        return ResponseEntity.ok("Task executed")
    }

    private fun checkAdminKey(adminKey: String) {
        if (adminKey != System.getenv("ADMIN_KEY")) {
            throw UnauthorizedException(
                ErrorCode.INVALID_ADMIN_CREDENTIALS,
                "Invalid admin credentials"
            )
        }
    }

}