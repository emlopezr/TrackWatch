package com.trackify.backend.service.implementation

import com.trackify.backend.repository.UserRepository
import com.trackify.backend.service.contract.UserService
import com.trackify.backend.model.core.User
import com.trackify.backend.model.dto.UserResponseDTO
import com.trackify.backend.clients.spotify.SpotifyApiClient
import com.trackify.backend.exception.BadRequestException
import com.trackify.backend.exception.NotFoundException
import com.trackify.backend.utils.ErrorCode

import org.springframework.stereotype.Service

// TODO: Use interface for userRepository - InMemoryUserRepository for certain profiles, and MongoUserRepository for others
@Service
class UserServiceImpl(
    private val userRepository: UserRepository,
    private val spotifyApiClient: SpotifyApiClient
): UserService {

    override fun registerUser(accessToken: String, refreshToken: String): UserResponseDTO {
        val spotifyUser = spotifyApiClient.getUser(accessToken)

        if (userRepository.existsById(spotifyUser.id)) {
            throw BadRequestException(ErrorCode.USER_ALREADY_EXISTS)
        }

        val user = User(spotifyUser, accessToken, refreshToken)
        val savedUser = userRepository.save(user)

        return UserResponseDTO(savedUser)
    }

    override fun getCurrentUser(accessToken: String, refreshToken: String): UserResponseDTO {
        var user = userRepository.findByAuthCurrentAccessToken(accessToken)
            ?: userRepository.findByAuthLastAccessToken(accessToken)
            ?: throw NotFoundException(ErrorCode.USER_NOT_FOUND)

        user.updateTokens(accessToken, refreshToken)

        user = userRepository.save(user)
        return UserResponseDTO(user)
    }
}