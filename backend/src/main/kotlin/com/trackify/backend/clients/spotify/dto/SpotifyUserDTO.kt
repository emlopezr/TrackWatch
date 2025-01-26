package com.trackify.backend.clients.spotify.dto

data class SpotifyUserDTO(
    val id: String,
    val email: String,
    val displayName: String,
    val blockedExplicitContent: Boolean,
)