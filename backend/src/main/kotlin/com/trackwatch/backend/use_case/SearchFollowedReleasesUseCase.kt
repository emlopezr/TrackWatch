package com.trackwatch.backend.use_case

import com.trackwatch.backend.model.Artist
import com.trackwatch.backend.model.Track
import com.trackwatch.backend.model.User
import com.trackwatch.backend.service.EmailService
import com.trackwatch.backend.service.PlaylistService
import com.trackwatch.backend.service.TrackService
import com.trackwatch.backend.service.UserService
import com.trackwatch.backend.utils.values.Constants
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.*

@Service
class SearchFollowedReleasesUseCase(
    private val trackService: TrackService,
    private val playlistService: PlaylistService,
    private val userService: UserService,
    private val emailService: EmailService
) {

    private val log = LoggerFactory.getLogger(SearchFollowedReleasesUseCase::class.java)

    fun updateNewReleasesForAllUsers(daysLimit: Int = Constants.FILTER_DAYS_LIMIT) {
        val users = userService.getAllUsers()
        log.info("Running new releases update for ${users.size} users")

        users.forEach { user ->
            try {
                updateUserNewReleases(user, daysLimit)
            } catch (e: Exception) {
                log.error("Error while updating new releases for user ${user.id}", e)
            }
        }

        log.info("New releases update finished")
    }

    fun updateUserNewReleases(user: User, daysLimit: Int = Constants.FILTER_DAYS_LIMIT) {
        val activeUser = getUserWithValidToken(user)
        val accessToken = activeUser.auth.current.accessToken

        val newReleaseTracks = findNewReleasesForUser(activeUser, accessToken, daysLimit)
        val addedTracks = updateNewReleasesPlaylist(activeUser, newReleaseTracks)

        updateUserRecentlyAddedTracks(activeUser, addedTracks)

        userService.saveUser(activeUser)
        emailService.sendAddedTracksEmail(user, addedTracks)
    }

    private fun getUserWithValidToken(user: User): User {
        return userService.getValidAccessToken(user)
    }

    private fun findNewReleasesForUser(user: User, accessToken: String, daysLimit: Int): List<Track> {
        val newReleases  = mutableSetOf<Track>()

        user.followedArtists.forEach { artist ->
            collectArtistTracks(user, artist, accessToken, newReleases, daysLimit)
        }

        return trackService.sortTracks(newReleases).toList()
    }

    private fun collectArtistTracks(
        user: User,
        artist: Artist,
        accessToken: String,
        userAddedTracks: MutableSet<Track>,
        daysLimit: Int
    ) {
        val artistNewTracks = trackService.searchArtistTracks(
            artist,
            accessToken,
            Constants.PAGES_TO_FETCH,
            daysLimit
        )

        artistNewTracks.forEach { track ->
            trackService.filterTrack(
                track,
                user,
                artist,
                userAddedTracks,
                daysLimit,
                shouldCheckTrackRecentlyAdded = true
            )
        }
    }

    private fun updateNewReleasesPlaylist(user: User, tracks: List<Track>): List<Track> {
        playlistService.checkPlaylist(user)
        return playlistService.addTracksToPlaylist(user, user.playlistId, tracks.toSet()).toList()
    }

    private fun updateUserRecentlyAddedTracks(user: User, addedTracks: List<Track>) {
        val persistedTracks = addedTracks.map { it.toPersistedTrack() }
        user.recentlyAddedTracks.addAll(persistedTracks)
        cleanupOldTracks(user)
    }

    private fun cleanupOldTracks(user: User) {
        val calendar = Calendar.getInstance(TimeZone.getTimeZone(Constants.SERVER_TIMEZONE))
        calendar.add(Calendar.DAY_OF_YEAR, -Constants.CLEANUP_DAYS_LIMIT)
        val maxDate = calendar.time

        val cleanedRecentlyAddedTracks = user.recentlyAddedTracks.filter {
            it.addedAt.after(maxDate)
        }

        user.recentlyAddedTracks = cleanedRecentlyAddedTracks.toMutableList()
    }
}