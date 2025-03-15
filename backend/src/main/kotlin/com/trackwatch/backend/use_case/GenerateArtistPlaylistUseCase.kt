package com.trackwatch.backend.use_case

import com.trackwatch.backend.clients.spotify.SpotifyArtistApiClient
import com.trackwatch.backend.exception.ErrorCode
import com.trackwatch.backend.exception.NotFoundException
import com.trackwatch.backend.model.Artist
import com.trackwatch.backend.model.Track
import com.trackwatch.backend.model.User
import com.trackwatch.backend.repository.UserRepository
import com.trackwatch.backend.service.PlaylistService
import com.trackwatch.backend.service.TrackService
import com.trackwatch.backend.utils.values.Constants
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import kotlin.math.abs

@Service
class GenerateArtistPlaylistUseCase(
    private val userRepository: UserRepository,
    private val playlistService: PlaylistService,
    private val trackService: TrackService,
    private val spotifyArtistApiClient: SpotifyArtistApiClient
) {

    private val log = LoggerFactory.getLogger(this::class.java)

    fun generateArtistPlaylist(userId: String, artistId: String, playlistId: String?, accessToken: String) {
        val user = retrieveAndValidateUser(userId, accessToken)
        val artist = spotifyArtistApiClient.getArtistInfo(artistId, accessToken)
        log.info("Generating playlist for artist: ${artist.name}")

        val tracks = collectArtistTracks(artist, accessToken)
        val filteredTracks = filterAndSortTracks(tracks, user, artist)

        val finalPlaylistId = createOrUpdatePlaylist(user, artist.name, playlistId)
        updatePlaylistContent(user, finalPlaylistId, filteredTracks, artist.imageUrl)

        log.info("Playlist generated for artist: ${artist.name}")
    }

    private fun retrieveAndValidateUser(userId: String, accessToken: String): User {
        val user = userRepository.findById(userId)
            .orElseThrow { NotFoundException(ErrorCode.USER_NOT_FOUND) }

        user.validateToken(accessToken)
        return user
    }

    private fun collectArtistTracks(artist: Artist, accessToken: String): Set<Track> {
        val findings = mutableSetOf<Track>()
        var iteration = 0

        while (true) {
            val tracks = spotifyArtistApiClient.searchArtistTracksWithRetries(
                artist,
                accessToken,
                daysLimit = null,
                iteration
            )

            if (
                tracks.isEmpty() ||
                !addTracksToFindings(tracks, findings, artist) ||
                iteration >= Constants.MAX_LOOP_ITERATION
            ) {
                break
            }

            iteration++
        }

        return findings
    }

    private fun filterAndSortTracks(tracks: Set<Track>, user: User, artist: Artist): List<Track> {
        val tracksToAdd = mutableSetOf<Track>()

        tracks.forEach { track ->
            trackService.filterTrack(
                track,
                user,
                artist,
                tracksToAdd,
                daysLimit = 0,
                shouldCheckCorrectArtist = true,
                shouldCheckTrackInTimeRange = false,
                shouldCheckCompilationAlbum = true,
                shouldCheckSongBlockedByUserSettings = false,
                shouldCheckTrackRecentlyAdded = false
            )
        }

        val sortedTracks = trackService.sortTracks(tracksToAdd).toList()
        val filteredTracks = trackService.removeDuplicateTracks(sortedTracks)

        return filteredTracks
    }

    private fun createOrUpdatePlaylist(user: User, artistName: String, existingPlaylistId: String?): String {
        val playlistName = generatePlaylistName(artistName)
        val playlistDescription = generatePlaylistDescription(artistName)

        return existingPlaylistId ?: playlistService.createPlaylist(user, playlistName, playlistDescription)
    }

    private fun updatePlaylistContent(user: User, playlistId: String, tracks: List<Track>, coverImageUrl: String) {
        playlistService.addTracksToPlaylist(
            user,
            playlistId,
            tracks.toSet(),
            shouldFilterUrisBySavedByUser = false
        )

        try {
            playlistService.updatePlaylistCover(user, playlistId, coverImageUrl)
        } catch (e: Exception) {
            log.error("Failed to upload playlist cover for playlist: $playlistId")
        }
    }

    private fun filterTracks(artist: Artist, tracks: List<Track>): List<Track> {
        return tracks.filter { track -> trackService.isCorrectArtist(track, artist) }
    }

    private fun generatePlaylistName(artistName: String): String =
        "All of: $artistName"

    private fun generatePlaylistDescription(artistName: String): String =
        "Every track from $artistName in one place (oldest to newest) - Powered by ${Constants.APP_NAME}"

    private fun addTracksToFindings(tracks: List<Track>, findings: MutableSet<Track>, artist: Artist): Boolean {
        val initialSize = findings.size
        val filteredTracks = filterTracks(artist, tracks)
        findings.addAll(filteredTracks)
        return initialSize != findings.size
    }

}