package com.trackify.backend.clients.spotify.dto

data class SpotifyUserDTO(
    val id: String,
    val email: String,
    val name: String,
    val imageUrl: String,
    val blockedExplicitContent: Boolean,
)