package com.trackwatch.backend.controller

import com.trackwatch.backend.service.MetricService
import com.trackwatch.backend.utils.values.Endpoints
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class UtilsController(metricService: MetricService): BaseController(metricService) {

    @GetMapping(Endpoints.PING)
    fun ping(): ResponseEntity<String> {
        sendMetricRequest(Endpoints.PING, "GET")
        return ResponseEntity.ok("pong")
    }

}