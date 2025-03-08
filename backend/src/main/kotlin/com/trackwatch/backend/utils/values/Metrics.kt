package com.trackwatch.backend.utils.values

object Metrics {
    private const val METRIC_PREFIX = "trackwatch_"

    const val REST_REQUEST = METRIC_PREFIX + "rest_request"
    const val CLIENT_REQUEST = METRIC_PREFIX + "client_request"
    const val EMAIL_SENT = METRIC_PREFIX + "email_sent"
    const val EXCEPTION = METRIC_PREFIX + "exception"
}