package com.trackwatch.backend.controller.dto

import com.trackwatch.backend.model.Artist
import com.trackwatch.backend.model.User
import com.trackwatch.backend.model.UserSettings

data class UserResponseDTO(
    val id: String,
    val playlistId: String,
    val email: String,
    val name: String,
    val imageUrl: String,
    val settings: UserSettings,
    val followedArtists: List<Artist>
) {
    constructor(user: User): this (
        id = user.id,
        playlistId = user.playlistId,
        email = user.email,
        name = user.name,
        imageUrl = user.imageUrl,
        settings = user.settings,
        followedArtists = user.followedArtists
    )
}
