package com.trackify.backend.utils.service

import io.micrometer.core.instrument.MeterRegistry
import org.springframework.stereotype.Service

@Service
class MetricService(private val meterRegistry: MeterRegistry) {

    fun incrementCounter(counterName: String, vararg tags: String) {
        val endpointCounter = meterRegistry.counter(counterName, *tags)
        endpointCounter.increment()
    }

}