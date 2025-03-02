package com.trackwatch.backend.utils.service

import io.micrometer.core.instrument.MeterRegistry
import org.springframework.stereotype.Service

@Service
class MetricService(private val meterRegistry: MeterRegistry) {

    fun incrementCounter(metricName: String, vararg tags: String) {
        val summary = meterRegistry.summary(metricName, *tags)
        summary.record(1.0)
    }

}
