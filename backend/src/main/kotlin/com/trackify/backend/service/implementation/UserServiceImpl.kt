package com.trackify.backend.service.implementation

import com.trackify.backend.repository.UserRepository
import com.trackify.backend.service.contract.UserService
import com.trackify.backend.model.core.User
import com.trackify.backend.model.core.UserTokens
import com.trackify.backend.model.dto.UserResponseDTO
import com.trackify.backend.clients.spotify.SpotifyApiClient

import org.springframework.stereotype.Service

// TODO: Use interface for userRepository - InMemoryUserRepository for certain profiles, and MongoUserRepository for others
@Service
class UserServiceImpl(
    private val userRepository: UserRepository,
    private val spotifyApiClient: SpotifyApiClient
): UserService {

    override fun registerUser(accessToken: String, refreshToken: String): UserResponseDTO {
        val spotifyUser = spotifyApiClient.getUser(accessToken)

        var user = User(spotifyUser, accessToken, refreshToken)
        user = userRepository.save(user)

        return UserResponseDTO(user)
    }

    override fun getUserById(userId: String, accessToken: String, refreshToken: String): UserResponseDTO {
        var user = userRepository.findById(userId).orElseThrow { IllegalArgumentException("User not found") }

        if (user.auth.current.accessToken != accessToken || user.auth.last.accessToken != accessToken) {
            throw IllegalArgumentException("Invalid access token")
        }

        user.auth.last = user.auth.current
        user.auth.current = UserTokens(accessToken, refreshToken)

        user = userRepository.save(user)
        return UserResponseDTO(user)
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