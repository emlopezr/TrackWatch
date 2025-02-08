package com.trackify.backend.controller.dto

import com.trackify.backend.model.core.Artist
import com.trackify.backend.model.core.User
import com.trackify.backend.model.core.UserImages
import com.trackify.backend.model.core.UserSettings

data class UserResponseDTO(
    val id: String,
    val playlistId: String,
    val email: String,
    val name: String,
    val settings: UserSettings,
    val images: List<UserImages>,
    val followedArtists: List<Artist>
) {
    constructor(user: User): this (
        id = user.id,
        playlistId = user.playlistId,
        email = user.email,
        name = user.name,
        settings = user.settings,
        images = user.images,
        followedArtists = user.followedArtists
    )
}
