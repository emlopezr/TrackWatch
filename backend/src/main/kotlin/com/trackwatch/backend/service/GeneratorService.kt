package com.trackwatch.backend.service

import com.trackwatch.backend.clients.spotify.SpotifyArtistApiClient
import com.trackwatch.backend.exception.NotFoundException
import com.trackwatch.backend.repository.UserRepository
import com.trackwatch.backend.utils.values.Constants
import com.trackwatch.backend.utils.values.ErrorCode
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class GeneratorService(
    private val userRepository: UserRepository,
    private val playlistService: PlaylistService,
    private val spotifyArtistApiClient: SpotifyArtistApiClient
) {

    private val log = LoggerFactory.getLogger(GeneratorService::class.java)

    fun generateArtistPlaylist(userId: String, artistId: String, accessToken: String) {
        val user = userRepository.findById(userId)
            .orElseThrow { NotFoundException(ErrorCode.USER_NOT_FOUND) }

        user.validateToken(accessToken)

        val artist = spotifyArtistApiClient.getArtistInfo(artistId, accessToken)
        val artistName = artist.name

        val playlistName = generatePlaylistName(artistName)
        val playlistDescription = generatePlaylistDescription(artistName)

        val playlistId = playlistService.createPlaylist(user, playlistName, playlistDescription)

        log.info("Generating playlist for artist: $artistName")

        var iteration = 0
        while (true) {
            log.info("Iteration $iteration")

            val tracks = spotifyArtistApiClient.getArtistNewTracksWithRetries(artist, accessToken, null, iteration)

            if (tracks.isEmpty()) { break }

            val addedTracks = playlistService.addTracksToPlaylist(
                user,
                playlistId,
                tracks.toSet(),
                shouldFilterUrisBySavedByUser = false
            )

            if (addedTracks.isEmpty()) { break }
            if (iteration >= Constants.MAX_ITERATION) { break }

            iteration++
        }

        log.info("Playlist generated for artist: $artistName")
    }

    fun generatePlaylistName(artistName: String): String {
        return "All of: $artistName"
    }

    fun generatePlaylistDescription(artistName: String): String {
        return "Every track from $artistName in one place – your complete collection, powered by TrackWatch."
    }

}