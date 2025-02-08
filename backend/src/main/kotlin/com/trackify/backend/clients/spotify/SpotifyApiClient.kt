package com.trackify.backend.clients.spotify

import com.trackify.backend.utils.values.Metrics
import com.trackify.backend.utils.values.Constants
import com.trackify.backend.utils.service.MetricService
import org.springframework.web.reactive.function.client.ExchangeStrategies
import org.springframework.web.reactive.function.client.WebClient

abstract class SpotifyApiClient(private val metricService: MetricService) {

    protected val webClient: WebClient = WebClient.builder()
        .exchangeStrategies(configWebClient())
        .baseUrl("https://api.spotify.com/v1")
        .build()

    protected val authWebClient: WebClient = WebClient.builder()
        .baseUrl("https://accounts.spotify.com/api")
        .build()

    protected fun sendMetricApiCall(method: String) {
        metricService.incrementCounter(
            Metrics.CLIENT_REQUEST,
            "client", this.javaClass.simpleName,
            "method", method
        )
    }

    private fun configWebClient(): ExchangeStrategies {
        return ExchangeStrategies.builder()
            .codecs { configurer -> configurer
                .defaultCodecs()
                .maxInMemorySize(Constants.MAX_IN_MEMORY_SIZE)
            }
            .build()
    }
}