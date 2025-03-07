package com.trackwatch.backend.scheluded

import com.trackwatch.backend.model.Track
import com.trackwatch.backend.model.User
import com.trackwatch.backend.service.EmailService
import com.trackwatch.backend.service.PlaylistService
import com.trackwatch.backend.service.TrackService
import com.trackwatch.backend.service.UserService
import com.trackwatch.backend.utils.values.Constants
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class ScheduledService(
    private val trackService: TrackService,
    private val playlistService: PlaylistService,
    private val userService: UserService,
    private val emailService: EmailService
) {

    private val log = LoggerFactory.getLogger(ScheduledService::class.java)

    fun runCoreTask(daysLimit: Int = Constants.DAYS_LIMIT) {
        val users = userService.getAllUsers()
        log.info("Running core task for ${users.size} users")

        users.forEach { user ->
            try {
                runCoreTask(user, daysLimit)
            } catch (e: Exception) {
                log.error("Error while running core task for user ${user.id}", e)
            }
        }

        log.info("Core task finished")
    }

    fun runCoreTask(user: User, daysLimit: Int = Constants.DAYS_LIMIT) {
        val userWithValidToken = userService.getValidAccessToken(user)
        val accessToken = userWithValidToken.auth.current.accessToken

        val userAddedTracks = mutableSetOf<Track>()

        userWithValidToken.followedArtists.forEach { artist ->
            val tracksToAdd = mutableSetOf<Track>()
            val artistNewTracks = trackService.getArtistNewTracks(artist, accessToken, Constants.PAGES_TO_FETCH, daysLimit)
            artistNewTracks.forEach { track -> trackService.filterTrack(track, userWithValidToken, artist, userAddedTracks, daysLimit) }
            userAddedTracks.addAll(tracksToAdd)
        }

        val userSortedTracks = trackService.sortTracks(userAddedTracks)

        playlistService.checkPlaylist(userWithValidToken)
        val finalAddedTracks = playlistService.addTracksToPlaylist(userWithValidToken, userWithValidToken.playlistId, userSortedTracks)

        emailService.sendAddedTracksEmail(userWithValidToken, finalAddedTracks.toList())
    }
}