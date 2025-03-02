package com.trackwatch.backend.clients.spotify.dto

data class SpotifyTokenDTO(
    val accessToken: String,
    val refreshToken: String
)
