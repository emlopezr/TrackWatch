package com.trackwatch.backend.service

import com.trackwatch.backend.clients.email.ResendClient
import com.trackwatch.backend.model.Track
import com.trackwatch.backend.model.User
import org.springframework.stereotype.Service

@Service
class EmailService(private val resendClient: ResendClient) {

    fun sendWelcomeEmail(user: User) {
        resendClient.sendWelcomeEmail(user)
    }

    fun sendAddedTracksEmail(user: User, addedTracks: List<Track>) {
        if (addedTracks.isNotEmpty()) {
            resendClient.sendAddedTracksEmail(user, addedTracks)
        }
    }

}