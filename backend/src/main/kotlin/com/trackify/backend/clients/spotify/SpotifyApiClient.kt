package com.trackify.backend.clients.spotify

import com.trackify.backend.clients.spotify.dto.SpotifyImageDTO
import com.trackify.backend.clients.spotify.dto.SpotifyUserDTO

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
                .block() ?: throw IllegalArgumentException("Invalid Spotify token")
            return mapToSpotifyUserDTO(response)
        } catch (e: WebClientResponseException) {
            throw handleSpotifyApiException(e)
        } catch (e: Exception) {
            throw RuntimeException("Error while calling Spotify API: ${e.message}")
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
            401 -> IllegalArgumentException("Unauthorized: Invalid Spotify token")
            403 -> IllegalStateException("Forbidden: Access denied to Spotify API")
            404 -> IllegalArgumentException("Spotify user not found")
            else -> RuntimeException("Error while calling Spotify API: ${e.message}")
        }
    }
}