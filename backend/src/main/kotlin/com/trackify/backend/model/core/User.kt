package com.trackify.backend.model.core

import com.trackify.backend.clients.spotify.dto.SpotifyUserDTO
import org.springframework.data.annotation.Id
import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "users")
data class User(
    @Id
    var id: String,

    var email: String,
    var name: String,

    var auth: UserAuth,
    var settings: UserSettings,
    var images: List<UserImages>,

    var followedArtists: MutableList<Artist> = mutableListOf()
) {
    constructor(dto: SpotifyUserDTO, accessToken: String, refreshToken: String): this(
        id = dto.id,
        email = dto.email,
        name = dto.name,
        auth = UserAuth(
            current = UserTokens(accessToken, refreshToken),
            last = UserTokens(accessToken, refreshToken)
        ),
        settings = UserSettings(dto.blockedExplicitContent),
        images = dto.images.map { UserImages(it.url, it.height, it.width) }
    )
}

data class UserAuth(
    var current: UserTokens,
    var last: UserTokens
)

data class UserTokens(
    val accessToken: String,
    val refreshToken: String
)

data class UserSettings(
    val blockedExplicitContent: Boolean
)

data class UserImages(
    var url: String,
    var height: Int,
    var width: Int
)