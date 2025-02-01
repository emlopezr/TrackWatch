package com.trackify.backend.scheluded

import com.trackify.backend.clients.spotify.SpotifyApiClient
import com.trackify.backend.repository.UserRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service

@Service
class ScheduledService(
    private val userRepository: UserRepository,
    private val spotifyApiClient: SpotifyApiClient
) {

    private val log = LoggerFactory.getLogger(ScheduledService::class.java)

    fun runCoreTask() {
        val users = userRepository.findAll()
        log.info("Running core task for ${users.size} users")

        users.forEach { user ->
            asyncRunTaskForUser(user.id)
        }

        // Await for all async tasks to finish
        log.info("Core task finished")
    }

    @Async
    fun asyncRunTaskForUser(userId: String) {
        log.info("Running async task for user $userId")
    }
}