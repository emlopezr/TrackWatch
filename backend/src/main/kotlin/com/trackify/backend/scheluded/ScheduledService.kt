package com.trackify.backend.scheluded

import com.trackify.backend.model.Track
import com.trackify.backend.model.User
import com.trackify.backend.service.PlaylistService
import com.trackify.backend.service.TrackService
import com.trackify.backend.service.UserService
import com.trackify.backend.utils.values.Constants
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service

@Service
class ScheduledService(
    private val trackService: TrackService,
    private val playlistService: PlaylistService,
    private val userService: UserService
) {

    private val log = LoggerFactory.getLogger(ScheduledService::class.java)

    fun runCoreTask() {
        val users = userService.getAllUsers()
        log.info("Running core task for ${users.size} users")

        users.forEach { user ->
            try {
                runCoreTask(user)
            } catch (e: Exception) {
                log.error("Error while running core task for user ${user.id}", e)
            }
        }

        log.info("Core task finished")
    }

    @Async
    fun runCoreTask(user: User) {
        val userWithValidToken = userService.getValidAccessToken(user)
        val accessToken = userWithValidToken.auth.current.accessToken

        val userAddedTracks = mutableSetOf<Track>()

        userWithValidToken.followedArtists.forEach { artist ->
            val tracksToAdd = mutableSetOf<Track>()
            val artistNewTracks = trackService.getArtistNewTracks(artist, accessToken, Constants.PAGES_TO_FETCH)
            artistNewTracks.forEach { track -> trackService.filterTrack(track, userWithValidToken, artist, userAddedTracks) }
            userAddedTracks.addAll(tracksToAdd)
        }

        log.info("User ${user.id}: ${userAddedTracks.size} tracks will be added to the playlist")
        val userSortedTracks = trackService.sortTracks(userAddedTracks)

        playlistService.checkPlaylist(userWithValidToken)
        playlistService.addTracksToPlaylist(userWithValidToken, userSortedTracks)
    }
}