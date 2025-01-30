package com.trackify.backend.clients.spotify.dto

data class SpotifyUserDTO(
    val id: String,
    val email: String,
    val name: String,
    val images: List<SpotifyImageDTO>,
    val blockedExplicitContent: Boolean,
)

data class SpotifyImageDTO(
    val url: String,
    val height: Int,
    val width: Int,
)