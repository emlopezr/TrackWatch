package com.trackwatch.backend.service

import com.trackwatch.backend.clients.spotify.SpotifyPlaylistApiClient
import com.trackwatch.backend.model.Track
import com.trackwatch.backend.model.User
import com.trackwatch.backend.repository.UserRepository
import com.trackwatch.backend.utils.service.ImageService
import com.trackwatch.backend.utils.values.Constants
import org.springframework.stereotype.Service

@Service
class PlaylistService(
    val spotifyPlaylistApiClient: SpotifyPlaylistApiClient,
    val imageService: ImageService,
    val userRepository: UserRepository
) {

    fun addTracksToPlaylist(
        user: User,
        playlistId: String,
        tracksToAdd: Set<Track>,
        shouldfilterUrisByExistingInPlaylist: Boolean = true,
        shouldFilterUrisBySavedByUser: Boolean = true
    ): Set<Track> {
        var trackUris = getTrackUris(tracksToAdd)

        if (shouldfilterUrisByExistingInPlaylist) {
            trackUris = filterUrisByExistingInPlaylist(user, playlistId, trackUris)
        }

        if (shouldFilterUrisBySavedByUser) {
            trackUris = filterUrisBySavedByUser(user, trackUris)
        }

        val chunkedTrackUris = trackUris.chunked(100)
        chunkedTrackUris.forEach {
            spotifyPlaylistApiClient.addTracksToPlaylist(user, playlistId, it)
        }

        return filterTracksByUris(tracksToAdd, trackUris)
    }

    fun getTrackUris(tracks: Set<Track>): Set<String> {
        return tracks.map { it.uri }.toSet()
    }

    fun filterUrisByExistingInPlaylist(user: User, playlistId: String, trackUris: Set<String>): Set<String> {
        val tracksInPlaylist = spotifyPlaylistApiClient.getPlaylistTracks(user, playlistId)
        return trackUris.filter { !tracksInPlaylist.contains(it) }.toSet()
    }

    fun filterUrisBySavedByUser(user: User, trackUris: Set<String>): Set<String> {
        return spotifyPlaylistApiClient.filterSavedTracks(user, trackUris)
    }

    fun filterTracksByUris(tracks: Set<Track>, uris: Set<String>): Set<Track> {
        return tracks.filter { uris.contains(it.uri) }.toSet()
    }

    fun createPlaylist(
        user: User,
        name: String = Constants.DEFAULT_PLAYLIST_NAME,
        description: String = Constants.DEFAULT_PLAYLIST_DESCRIPTION,
        isPublic: Boolean = Constants.DEFAULT_PLAYLIST_PRIVACY
    ): String {
        return spotifyPlaylistApiClient.createPlaylist(user, name, description, isPublic)
    }

    fun uploadPlaylistCover(user: User, playlistId: String, coverUrl: String) {
        val coverBase64 = imageService.encodeImageToBase64(coverUrl) ?: return
        spotifyPlaylistApiClient.uploadPlaylistCover(user, playlistId, coverBase64)
    }

    fun checkPlaylist(user: User) {
        val playlistExists = spotifyPlaylistApiClient.checkPlaylistExists(user)

        if (!playlistExists) {
            val playlistId = createPlaylist(user)
            val userUpdated = user.copy(playlistId = playlistId)
            userRepository.save(userUpdated)
        }
    }

}