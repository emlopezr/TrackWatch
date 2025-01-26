package com.trackify.backend.model.dto

import com.trackify.backend.model.core.Artist
import com.trackify.backend.model.core.user.UserSettings

data class UserResponseDTO(
    val id: String,
    val email: String,
    val displayName: String,
    val userSettings: UserSettings,
    val followedArtists: List<Artist>
)
