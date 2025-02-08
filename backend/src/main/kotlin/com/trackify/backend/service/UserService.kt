package com.trackify.backend.service

import com.trackify.backend.clients.spotify.SpotifyAuthApiClient
import com.trackify.backend.clients.spotify.SpotifyPlaylistApiClient
import com.trackify.backend.repository.UserRepository
import com.trackify.backend.model.core.User
import com.trackify.backend.controller.dto.UserResponseDTO
import com.trackify.backend.clients.spotify.SpotifyUserApiClient
import com.trackify.backend.exception.BadRequestException
import com.trackify.backend.exception.NotFoundException
import com.trackify.backend.utils.values.ErrorCode

import org.springframework.stereotype.Service

// TODO: Use interface for userRepository - InMemoryUserRepository for certain profiles, and MongoUserRepository for others
@Service
class UserService(
    private val userRepository: UserRepository,
    private val spotifyUserApiClient: SpotifyUserApiClient,
    private val spotifyPlaylistApiClient: SpotifyPlaylistApiClient,
    private val spotifyAuthApiClient: SpotifyAuthApiClient
) {

    fun registerUser(accessToken: String, refreshToken: String): UserResponseDTO {
        val spotifyUser = spotifyUserApiClient.getUser(accessToken)

        if (userRepository.existsById(spotifyUser.id)) {
            throw BadRequestException(ErrorCode.USER_ALREADY_EXISTS)
        }

        val user = User(spotifyUser, accessToken, refreshToken)
        val updatedUser = spotifyPlaylistApiClient.createPlaylist(user)
        val savedUser = userRepository.save(updatedUser)

        return UserResponseDTO(savedUser)
    }

    fun getCurrentUser(accessToken: String, refreshToken: String): UserResponseDTO {
        val spotifyUser = spotifyUserApiClient.getUser(accessToken)

        val user = userRepository.findById(spotifyUser.id)
            .orElseThrow { NotFoundException(ErrorCode.USER_NOT_FOUND) }

        user.updateTokens(accessToken, refreshToken)

        val savedUser = userRepository.save(user)
        return UserResponseDTO(savedUser)
    }

    fun getValidAccessToken(user: User): User {
        val refreshToken = user.auth.current.refreshToken

        val newTokens = spotifyAuthApiClient.refreshAccessToken(refreshToken)
        user.updateTokens(newTokens.accessToken, newTokens.refreshToken)

        return userRepository.save(user)
    }
}