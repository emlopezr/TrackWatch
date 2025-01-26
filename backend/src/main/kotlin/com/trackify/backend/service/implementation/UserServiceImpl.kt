package com.trackify.backend.service.implementation

import com.trackify.backend.clients.spotify.SpotifyApiClient
import com.trackify.backend.model.core.user.User
import com.trackify.backend.model.core.user.UserAuth
import com.trackify.backend.model.core.user.UserSettings
import com.trackify.backend.model.dto.UserResponseDTO
import com.trackify.backend.repository.UserRepository
import org.springframework.stereotype.Service

// TODO: Use interface for userRepository - InMemoryUserRepository for certain profiles, and MongoUserRepository for others
@Service
class UserServiceImpl(
    private val userRepository: UserRepository,
    private val spotifyApiClient: SpotifyApiClient
) {

    fun registerUser(spotifyAccessToken: String, spotifyRefreshToken: String): UserResponseDTO {
        // Validate the access token while getting the user data
        val spotifyUser = spotifyApiClient.getUser(spotifyAccessToken)

        // Create the user object and save it to the database
        val user = User(
            id = spotifyUser.id,
            email = spotifyUser.email,
            displayName = spotifyUser.display_name,
            userAuth = UserAuth(
                accessToken = spotifyAccessToken,
                refreshToken = spotifyRefreshToken
            ),
            userSettings = UserSettings(
                blockedExplicitContent = spotifyUser.explicit_content.filter_enabled,
            )
        )

        val savedUser = userRepository.save(user)

        // Return the user filtered for the response
        return UserResponseDTO(
            id = savedUser.id,
            email = savedUser.email,
            displayName = savedUser.displayName,
            userSettings = user.userSettings,
            followedArtists = savedUser.followedArtists
        )
    }

    fun getUserById(userId: String): UserResponseDTO {
        val user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }

        return UserResponseDTO(
            id = user.id,
            email = user.email,
            displayName = user.displayName,
            userSettings = user.userSettings,
            followedArtists = user.followedArtists
        )
    }

//
//    // TODO: Migrate to ArtistService getting user by the auth token
//    // TODO: Exception handling (custom exceptions)
//    fun followArtist(userId: String, artistId: String, artistName: String): MutableList<Artist> {
//        val user = userRepository.findById(userId) ?: throw IllegalArgumentException("User not found")
//        val artist = Artist(artistId, artistName)
//
//        if (user.followedArtists.any { it.id == artistId }) {
//            throw IllegalArgumentException("User already follows this artist")
//        }
//
//        user.followedArtists.add(artist)
//        userRepository.save(user)
//
//        return user.followedArtists
//    }
//
//    // TODO: Migrate to ArtistService getting user by the auth token
//    // TODO: Exception handling (custom exceptions)
//    fun unfollowArtist(userId: String, artistId: String): MutableList<Artist> {
//        val user = userRepository.findById(userId) ?: throw IllegalArgumentException("User not found")
//        val artist = user.followedArtists.find { it.id == artistId } ?: throw IllegalArgumentException("User does not follow this artist")
//
//        user.followedArtists.remove(artist)
//        userRepository.save(user)
//
//        return user.followedArtists
//    }
}