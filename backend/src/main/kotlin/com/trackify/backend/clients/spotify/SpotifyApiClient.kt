package com.trackify.backend.clients.spotify

import com.trackify.backend.clients.spotify.dto.SpotifyUserDTO
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.WebClientResponseException

@Component
class SpotifyApiClient {

    private val webClient: WebClient = WebClient.builder()
        .baseUrl("https://api.spotify.com/v1")
        .build()

    fun getUser(spotifyAccessToken: String): SpotifyUserDTO {
        return try {
            webClient.get()
                .uri("/me")
                .header("Authorization", "Bearer $spotifyAccessToken")
                .retrieve()
                .bodyToMono(SpotifyUserDTO::class.java)
                .block() ?: throw IllegalArgumentException("Invalid Spotify token")
        } catch (e: WebClientResponseException) {
            when (e.statusCode.value()) {
                401 -> throw IllegalArgumentException("Unauthorized: Invalid Spotify token")
                403 -> throw IllegalStateException("Forbidden: Access denied to Spotify API")
                404 -> throw IllegalArgumentException("Spotify user not found")
                else -> throw RuntimeException("Error while calling Spotify API: ${e.message}")
            }
        } catch (e: Exception) {
            throw RuntimeException("Error while calling Spotify API: ${e.message}")
        }
    }
}