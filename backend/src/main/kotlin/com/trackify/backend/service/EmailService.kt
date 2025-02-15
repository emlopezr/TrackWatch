package com.trackify.backend.service

import com.trackify.backend.clients.email.ResendClient
import com.trackify.backend.model.Track
import com.trackify.backend.model.User
import org.springframework.stereotype.Service

@Service
class EmailService(private val resendClient: ResendClient) {

    fun sendEmail(user: User, addedTracks: List<Track>) {
        if (addedTracks.isNotEmpty()) {
            resendClient.sendEmail(user, addedTracks)
        }
    }

}