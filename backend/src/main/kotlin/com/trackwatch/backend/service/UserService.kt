package com.trackwatch.backend.service

import com.trackwatch.backend.clients.spotify.SpotifyAuthApiClient
import com.trackwatch.backend.repository.UserRepository
import com.trackwatch.backend.model.User
import com.trackwatch.backend.controller.dto.UserResponseDTO
import com.trackwatch.backend.clients.spotify.SpotifyUserApiClient
import com.trackwatch.backend.exception.BadRequestException
import com.trackwatch.backend.exception.NotFoundException
import com.trackwatch.backend.exception.ErrorCode
import com.trackwatch.backend.utils.values.Constants

import org.springframework.stereotype.Service

@Service
class UserService(
    private val userRepository: UserRepository,
    private val emailService: EmailService,
    private val playlistService: PlaylistService,
    private val spotifyUserApiClient: SpotifyUserApiClient,
    private val spotifyAuthApiClient: SpotifyAuthApiClient,
) {

    fun getAllUsers(): List<User> {
        return userRepository.findAll()
    }

    fun registerUser(accessToken: String, refreshToken: String): UserResponseDTO {
        val spotifyUser = spotifyUserApiClient.getUser(accessToken)

        if (userRepository.existsById(spotifyUser.id)) {
            throw BadRequestException(ErrorCode.USER_ALREADY_EXISTS)
        }

        val user = User(spotifyUser, accessToken, refreshToken)

        val playlistId = playlistService.createPlaylist(user)
        playlistService.updatePlaylistCover(user, playlistId, Constants.DEFAULT_PLAYLIST_COVER_URL)

        val updatedUser = user.copy(playlistId = playlistId)
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

    fun getValidAccessToken(user: User): User {
        val refreshToken = user.auth.current.refreshToken

        val newTokens = spotifyAuthApiClient.refreshAccessTokenWithRetries(refreshToken)
        user.updateTokens(newTokens.accessToken, newTokens.refreshToken)

        return userRepository.save(user)
    }

    fun saveUser(user: User): User {
        return userRepository.save(user)
    }
}