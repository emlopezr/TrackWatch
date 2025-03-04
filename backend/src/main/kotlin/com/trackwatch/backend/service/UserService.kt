package com.trackwatch.backend.service

import com.trackwatch.backend.clients.spotify.SpotifyAuthApiClient
import com.trackwatch.backend.clients.spotify.SpotifyPlaylistApiClient
import com.trackwatch.backend.repository.UserRepository
import com.trackwatch.backend.model.User
import com.trackwatch.backend.controller.dto.UserResponseDTO
import com.trackwatch.backend.clients.spotify.SpotifyUserApiClient
import com.trackwatch.backend.exception.BadRequestException
import com.trackwatch.backend.exception.NotFoundException
import com.trackwatch.backend.utils.values.ErrorCode

import org.springframework.stereotype.Service

// TODO: Use interface for userRepository - InMemoryUserRepository for certain profiles, and MongoUserRepository for others
@Service
class UserService(
    private val userRepository: UserRepository,
    private val emailService: EmailService,
    private val spotifyUserApiClient: SpotifyUserApiClient,
    private val spotifyPlaylistApiClient: SpotifyPlaylistApiClient,
    private val spotifyAuthApiClient: SpotifyAuthApiClient,
) {

    fun registerUser(accessToken: String, refreshToken: String): UserResponseDTO {
        val spotifyUser = spotifyUserApiClient.getUser(accessToken)

        if (userRepository.existsById(spotifyUser.id)) {
            throw BadRequestException(ErrorCode.USER_ALREADY_EXISTS)
        }

        val user = User(spotifyUser, accessToken, refreshToken)
        val updatedUser = spotifyPlaylistApiClient.createPlaylist(user)
        val savedUser = userRepository.save(updatedUser)

        emailService.sendWelcomeEmail(savedUser)
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

    fun getAllUsers(): List<User> {
        return userRepository.findAll()
    }

    fun getValidAccessToken(user: User): User {
        val refreshToken = user.auth.current.refreshToken

        val newTokens = spotifyAuthApiClient.refreshAccessToken(refreshToken)
        user.updateTokens(newTokens.accessToken, newTokens.refreshToken)

        return userRepository.save(user)
    }
}