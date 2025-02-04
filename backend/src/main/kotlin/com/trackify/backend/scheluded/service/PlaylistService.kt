package com.trackify.backend.scheluded.service

import com.trackify.backend.clients.spotify.SpotifyPlaylistApiClient
import com.trackify.backend.model.core.Track
import com.trackify.backend.model.core.User
import com.trackify.backend.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class PlaylistService(
    val spotifyPlaylistApiClient: SpotifyPlaylistApiClient,
    val userRepository: UserRepository
) {

    fun addTracksToPlaylist(user: User, tracksToAdd: Set<Track>): Set<Track> {
        var trackUris = getTrackUris(tracksToAdd)

        trackUris = filterUrisByExistingInPlaylist(user, trackUris)
        trackUris = filterUrisBySavedByUser(user, trackUris)

        val chunkedTrackUris = trackUris.chunked(100)
        chunkedTrackUris.forEach {
            spotifyPlaylistApiClient.addTracksToPlaylist(user, it)
        }

        return filerTracksByUris(tracksToAdd, trackUris)
    }

    fun getTrackUris(tracks: Set<Track>): Set<String> {
        return tracks.map { it.uri }.toSet()
    }

    fun filterUrisByExistingInPlaylist(user: User, trackUris: Set<String>): Set<String> {
        val tracksInPlaylist = spotifyPlaylistApiClient.getPlaylistTracks(user)
        return trackUris.filter { !tracksInPlaylist.contains(it) }.toSet()
    }

    fun filterUrisBySavedByUser(user: User, trackUris: Set<String>): Set<String> {
        return spotifyPlaylistApiClient.filterSavedTracks(user, trackUris)
    }

    fun filerTracksByUris(tracks: Set<Track>, uris: Set<String>): Set<Track> {
        return tracks.filter { uris.contains(it.uri) }.toSet()
    }

    fun checkPlaylist(user: User) {
        val playlistExists = spotifyPlaylistApiClient.checkPlaylistExists(user)

        if (!playlistExists) {
            val userUpdated = spotifyPlaylistApiClient.createPlaylist(user)
            userRepository.save(userUpdated)
        }
    }

}