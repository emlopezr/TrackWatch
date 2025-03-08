package com.trackwatch.backend.service

import com.trackwatch.backend.clients.spotify.SpotifyArtistApiClient
import com.trackwatch.backend.exception.NotFoundException
import com.trackwatch.backend.model.Artist
import com.trackwatch.backend.model.Track
import com.trackwatch.backend.model.User
import com.trackwatch.backend.repository.UserRepository
import com.trackwatch.backend.utils.values.Constants
import com.trackwatch.backend.utils.values.ErrorCode
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import kotlin.math.abs

@Service
class GeneratorService(
    private val userRepository: UserRepository,
    private val playlistService: PlaylistService,
    private val trackService: TrackService,
    private val spotifyArtistApiClient: SpotifyArtistApiClient
) {

    private val log = LoggerFactory.getLogger(GeneratorService::class.java)

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
                iteration >= Constants.MAX_ITERATION
            ) {  break }

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
                shouldCheckSongBlockedByUserSettings = false
            )
        }

        val sortedTracks = trackService.sortTracks(tracksToAdd)
        return removeDuplicateTracks(sortedTracks.toList())
    }

    private fun removeDuplicateTracks(tracks: List<Track>): List<Track> {
        val uniqueTracks = mutableListOf<Track>()
        val processedTracks = mutableMapOf<String, Track>()

        for (track in tracks) {
            val baseSignature = generateTrackSignatureWithoutDuration(track)

            if (processedTracks.containsKey(baseSignature)) {
                val existingTrack = processedTracks[baseSignature]!!
                val durationDifference = abs(track.durationMs - existingTrack.durationMs)

                // If duration differs by more than 1000ms (1 second), consider it a different track
                if (durationDifference > 1000) {
                    val uniqueSignature = "$baseSignature|${track.durationMs}"
                    processedTracks[uniqueSignature] = track
                    uniqueTracks.add(track)
                }
            } else {
                processedTracks[baseSignature] = track
                uniqueTracks.add(track)
            }
        }

        return uniqueTracks
    }

    private fun generateTrackSignatureWithoutDuration(track: Track): String {
        val normalizedName = track.name.lowercase()
        val artistsSignature = track.artists
            .map { it.name.lowercase() }
            .sorted()
            .joinToString(",")

        return "$normalizedName|$artistsSignature"
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
            Thread.sleep(2500)
            playlistService.uploadPlaylistCover(user, playlistId, coverImageUrl)
        } catch (e: Exception) {
            log.error("Failed to upload playlist cover for playlist: $playlistId")
        }
    }

    private fun filterTracks(artist: Artist, tracks: List<Track>): List<Track> {
        return tracks.filter { track -> trackService.isCorrectArtist(track, artist) }
    }

    private fun generatePlaylistName(artistName: String): String {
        return "All of: $artistName"
    }

    private fun generatePlaylistDescription(artistName: String): String {
        return "Every track from $artistName in one place - Powered by TrackWatch"
    }

    private fun addTracksToFindings(tracks: List<Track>, findings: MutableSet<Track>, artist: Artist): Boolean {
        val initialSize = findings.size
        val filteredTracks = filterTracks(artist, tracks)
        findings.addAll(filteredTracks)
        return initialSize != findings.size
    }

}