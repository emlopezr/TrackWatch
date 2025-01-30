package com.trackify.backend.clients.spotify

import com.trackify.backend.clients.spotify.dto.SpotifyImageDTO
import com.trackify.backend.clients.spotify.dto.SpotifyUserDTO
import com.trackify.backend.exception.ForbiddenException
import com.trackify.backend.exception.InternalServerErrorException
import com.trackify.backend.exception.NotFoundException
import com.trackify.backend.exception.UnauthorizedException
import com.trackify.backend.utils.ErrorCode

import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClientResponseException

@Component
class SpotifyApiClient {

    private val webClient: WebClient = WebClient.builder()
        .baseUrl("https://api.spotify.com/v1").build()

    fun getUser(accessToken: String): SpotifyUserDTO {
        try {
            val response = webClient.get()
                .uri("/me")
                .header("Authorization", "Bearer $accessToken")
                .retrieve()
                .bodyToMono(Map::class.java)
                .block() ?: throw UnauthorizedException(ErrorCode.SPOTIFY_INVALID_ACCESS_TOKEN)
            return mapToSpotifyUserDTO(response)
        } catch (e: WebClientResponseException) {
            throw handleSpotifyApiException(e)
        } catch (e: Exception) {
            throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, "Error while calling Spotify API", e.message ?: "")
        }
    }

    private fun mapToSpotifyUserDTO(response: Map<*, *>): SpotifyUserDTO {
        val explicitContent = response["explicit_content"] as Map<*, *>
        val imagesJson = response["images"] as List<*>

        val images = imagesJson.map { image ->
            val imageMap = image as Map<*, *>
            SpotifyImageDTO(
                url = imageMap["url"] as String,
                height = imageMap["height"] as Int,
                width = imageMap["width"] as Int
            )
        }

        return SpotifyUserDTO(
            id = response["id"] as String,
            email = response["email"] as String,
            name = response["display_name"] as String,
            images = images,
            blockedExplicitContent = explicitContent["filter_enabled"] as Boolean
        )
    }

    private fun handleSpotifyApiException(e: WebClientResponseException): Exception {
        return when (e.statusCode.value()) {
            401 -> UnauthorizedException(ErrorCode.SPOTIFY_INVALID_ACCESS_TOKEN, details = e.message)
            403 -> ForbiddenException(ErrorCode.SPOTIFY_FORBIDDEN_REQUEST, details = e.message)
            404 -> NotFoundException(ErrorCode.SPOTIFY_USER_NOT_FOUND)
            else -> RuntimeException("Error while calling Spotify API: ${e.message}")
        }
    }
}