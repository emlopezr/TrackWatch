package com.trackwatch.backend.controller

import com.trackwatch.backend.utils.service.MetricService
import com.trackwatch.backend.utils.values.Metrics

abstract class BaseController(private val metricService: MetricService) {

    protected fun sendMetricRequest(endpoint: String, httpMethod: String) {
        metricService.incrementCounter(Metrics.REST_REQUEST,
            "controller", this.javaClass.simpleName,
            "endpoint", endpoint,
            "method", httpMethod
        )
    }

}