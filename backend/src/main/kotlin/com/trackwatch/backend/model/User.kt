package com.trackwatch.backend.model

import com.trackwatch.backend.clients.spotify.dto.SpotifyUserDTO
import com.trackwatch.backend.exception.UnauthorizedException
import com.trackwatch.backend.utils.values.Constants
import com.trackwatch.backend.exception.ErrorCode
import jakarta.persistence.AttributeOverride
import jakarta.persistence.AttributeOverrides
import jakarta.persistence.CollectionTable
import jakarta.persistence.Column
import jakarta.persistence.ElementCollection
import jakarta.persistence.Embeddable
import jakarta.persistence.Embedded
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.Table

@Entity
@Table(name = Constants.USER_DB_TABLE)
data class User(
    @Id
    var id: String = "",

    @Column(name = "playlist_id")
    var playlistId: String = "",

    @Column(name = "email")
    var email: String = "",

    @Column(name = "name")
    var name: String = "",

    @Column(name = "image_url")
    var imageUrl: String = "",

    @Embedded
    var auth: UserAuth = UserAuth(),

    @Embedded
    var settings: UserSettings = UserSettings(),

    @ElementCollection
    @CollectionTable(
        name = Constants.USER_FOLLOWED_ARTIST_DB_TABLE,
        joinColumns = [JoinColumn(name = "user_id")]
    )
    var followedArtists: MutableList<Artist> = mutableListOf(),

    // I want to add a list of recently added tracks
    @ElementCollection
    @CollectionTable(
        name = Constants.USER_RECENTLY_ADDED_TRACKS_DB_TABLE,
        joinColumns = [JoinColumn(name = "user_id")]
    )
    var recentlyAddedTracks: MutableList<PersistedTrack> = mutableListOf()
) {

    constructor(dto: SpotifyUserDTO, accessToken: String, refreshToken: String): this(
        id = dto.id,
        playlistId = "",
        email = dto.email,
        name = dto.name,
        imageUrl = dto.imageUrl,
        auth = UserAuth(
            current = UserTokens(accessToken, refreshToken),
            last = UserTokens(accessToken, refreshToken)
        ),
        settings = UserSettings(
            blockedExplicitContent = dto.blockedExplicitContent
        )
    )

    fun validateToken(accessToken: String) {
        if (auth.current.accessToken != accessToken && auth.last.accessToken != accessToken) {
            throw UnauthorizedException(ErrorCode.USER_INVALID_CREDENTIALS)
        }
    }

    fun updateTokens(accessToken: String, refreshToken: String) {
        auth.last = auth.current
        auth.current = UserTokens(accessToken, refreshToken)
    }

}

@Embeddable
data class UserAuth(
    @Embedded
    @AttributeOverrides(
        AttributeOverride(
            name = "accessToken",
            column = Column(name = "current_access_token", columnDefinition = "TEXT")
        ),
        AttributeOverride(
            name = "refreshToken",
            column = Column(name = "current_refresh_token", columnDefinition = "TEXT")
        )
    )
    var current: UserTokens = UserTokens(),

    @Embedded
    @AttributeOverrides(
        AttributeOverride(
            name = "accessToken",
            column = Column(name = "last_access_token", columnDefinition = "TEXT")
        ),
        AttributeOverride(
            name = "refreshToken",
            column = Column(name = "last_refresh_token", columnDefinition = "TEXT")
        )
    )
    var last: UserTokens = UserTokens()
)

@Embeddable
data class UserTokens(
    var accessToken: String = "",
    var refreshToken: String = ""
)

@Embeddable
data class UserSettings(
    @Column(name = "setting_blocked_explicit_content")
    var blockedExplicitContent: Boolean = false
)
