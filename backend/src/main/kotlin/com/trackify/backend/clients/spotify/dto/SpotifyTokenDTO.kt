package com.trackify.backend.clients.spotify.dto

data class SpotifyTokenDTO(
    val accessToken: String,
    val refreshToken: String
)
