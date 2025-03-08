package com.trackwatch.backend.service

import com.trackwatch.backend.clients.email.ResendClient
import com.trackwatch.backend.model.Track
import com.trackwatch.backend.model.User
import com.trackwatch.backend.utils.service.EmailHelper
import org.springframework.stereotype.Service

@Service
class EmailService(
    private val resendClient: ResendClient,
    private val emailHelper: EmailHelper
) {

    fun sendWelcomeEmail(user: User) {
        val subject = emailHelper.generateWelcomeEmailSubject()
        val htmlBody = emailHelper.generateWelcomeEmailBody(user)
        resendClient.sendEmail(user, subject, htmlBody)
    }

    fun sendAddedTracksEmail(user: User, addedTracks: List<Track>) {
        if (addedTracks.isNotEmpty()) {
            val subject = emailHelper.generateAddedTracksEmailSubject(addedTracks)
            val htmlBody = emailHelper.generateAddedTracksEmailBody(addedTracks)
            resendClient.sendEmail(user, subject, htmlBody)
        }
    }

}