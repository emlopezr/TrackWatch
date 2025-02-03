package com.trackify.backend.scheluded

import com.trackify.backend.model.core.Track
import com.trackify.backend.model.core.User
import com.trackify.backend.repository.UserRepository
import com.trackify.backend.scheluded.service.PlaylistService
import com.trackify.backend.scheluded.service.TrackService
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service

@Service
class ScheduledService(
    private val userRepository: UserRepository,
    private val trackService: TrackService,
    private val playlistService: PlaylistService
) {

    private val log = LoggerFactory.getLogger(ScheduledService::class.java)

    fun runCoreTask() {
        val users = userRepository.findAll()
        log.info("Running core task for ${users.size} users")
        users.forEach { user -> runCoreTask(user) }
        log.info("Core task finished")
    }

    @Async
    fun runCoreTask(user: User) {
        val accessToken = user.getValidAccessToken()
        val userAddedTracks = mutableSetOf<Track>()

        user.followedArtists.forEach { artist ->
            val tracksToAdd = mutableSetOf<Track>()
            val artistNewTracks = trackService.getArtistNewTracks(artist, accessToken, 2)
            artistNewTracks.forEach { track -> trackService.filterTrack(track, user, artist, userAddedTracks) }
            userAddedTracks.addAll(tracksToAdd)
        }

        val userSortedTracks = trackService.sortTracks(userAddedTracks)
        playlistService.addTracksToPlaylist(user, userSortedTracks)
    }
}