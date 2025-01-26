package com.trackify.backend.clients.spotify.dto

data class SpotifyUserDTO(
    val id: String,
    val email: String,
    val display_name: String,
    val explicit_content: ExplicitContent,
)

data class ExplicitContent(
    val filter_enabled: Boolean
)