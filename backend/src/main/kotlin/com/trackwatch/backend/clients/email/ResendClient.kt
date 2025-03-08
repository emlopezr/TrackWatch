package com.trackwatch.backend.clients.email

import com.resend.Resend
import com.resend.services.emails.model.CreateEmailOptions
import com.trackwatch.backend.exception.InternalServerErrorException
import com.trackwatch.backend.model.User
import com.trackwatch.backend.service.MetricService
import com.trackwatch.backend.exception.ErrorCode
import com.trackwatch.backend.utils.values.Metrics
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

@Component
class ResendClient(private val metricService: MetricService) {

    private val log = LoggerFactory.getLogger(ResendClient::class.java)
    private val resend = Resend(System.getenv("RESEND_API_KEY"))

    fun sendEmail(recipient: User, emailSubject: String, emailBody: String) {
        val params = createEmailParams(recipient, emailSubject, emailBody)

        try {
            sendMetricEmail()
            resend.emails().send(params)

        } catch (e: Exception) {
            log.error("Failed to send email: ${e.message}")
            throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, "Failed to send email: ${e.message}")
        }
    }

    private fun createEmailParams(recipient: User, emailSubject: String, emailBody: String): CreateEmailOptions {
        return CreateEmailOptions.builder()
            .from("TrackWatch <trackwatch@emlopezr.com>")
            .to(recipient.email)
            .subject(emailSubject)
            .html(emailBody)
            .build()
    }

    private fun sendMetricEmail() {
        metricService.incrementCounter(
            Metrics.EMAIL_SENT,
            "provider", "resend"
        )
    }
}
