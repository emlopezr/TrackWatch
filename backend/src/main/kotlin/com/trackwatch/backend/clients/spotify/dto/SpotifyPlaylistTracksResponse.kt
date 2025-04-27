package com.trackwatch.backend.clients.spotify.dto

data class SpotifyPlaylistTracksResponse(
    val href: String,
    val items: List<SpotifyPlaylistItem>,
    val total: Int
)

data class SpotifyPlaylistItem(
    val track: SpotifyTrack?
)

data class SpotifyTrack(
    val uri: String
)