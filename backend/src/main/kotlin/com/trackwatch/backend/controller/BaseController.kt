package com.trackwatch.backend.controller

import com.trackwatch.backend.exception.UnauthorizedException
import com.trackwatch.backend.service.MetricService
import com.trackwatch.backend.exception.ErrorCode
import com.trackwatch.backend.utils.values.Metrics

abstract class BaseController(private val metricService: MetricService) {

    protected fun checkAdminKey(adminKey: String) {
        if (adminKey != System.getenv("ADMIN_KEY")) {
            throw UnauthorizedException(
                ErrorCode.INVALID_ADMIN_CREDENTIALS,
                "Invalid admin credentials"
            )
        }
    }

    protected fun sendMetricRequest(endpoint: String, httpMethod: String) {
        metricService.incrementCounter(Metrics.REST_REQUEST,
            "controller", this.javaClass.simpleName,
            "endpoint", endpoint,
            "method", httpMethod
        )
    }

}