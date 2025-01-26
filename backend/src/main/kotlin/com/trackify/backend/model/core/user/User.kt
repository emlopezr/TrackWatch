package com.trackify.backend.model.core.user

import com.trackify.backend.model.core.Artist
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "users")
data class User(
    @Id
    var id: String,

    var email: String,
    var displayName: String,

    var userAuth: UserAuth,
    var userSettings: UserSettings,

    var followedArtists: MutableList<Artist> = mutableListOf()
)