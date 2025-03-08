package com.trackwatch.backend.controller

import com.trackwatch.backend.use_case.CoreService
import com.trackwatch.backend.service.MetricService
import com.trackwatch.backend.utils.values.Constants
import com.trackwatch.backend.utils.values.Endpoints
import com.trackwatch.backend.utils.values.Headers
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class UtilsController(
    private val coreService: CoreService,
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
        @RequestParam(required = false) daysLimit: Int?
    ): ResponseEntity<String> {
        sendMetricRequest(Endpoints.RUN_CORE_TASK, "POST")
        checkAdminKey(adminKey)
        coreService.runCoreTask(daysLimit ?: Constants.FILTER_DAYS_LIMIT)
        return ResponseEntity.ok("Task executed")
    }

}