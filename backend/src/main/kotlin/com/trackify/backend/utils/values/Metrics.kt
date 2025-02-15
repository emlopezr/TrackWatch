package com.trackify.backend.utils.values

object Metrics {

    private const val METRIC_PREFIX = "trackify_"

    const val REST_REQUEST = METRIC_PREFIX + "rest_request"
    const val CLIENT_REQUEST = METRIC_PREFIX + "client_request"
    const val EXCEPTION = METRIC_PREFIX + "exception"
}