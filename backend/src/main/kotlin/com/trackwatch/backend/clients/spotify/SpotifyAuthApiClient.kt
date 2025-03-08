package com.trackwatch.backend.clients.spotify

import com.trackwatch.backend.clients.spotify.dto.SpotifyTokenDTO
import com.trackwatch.backend.exception.*
import com.trackwatch.backend.exception.ErrorCode
import com.trackwatch.backend.utils.service.MetricService
import org.slf4j.LoggerFactory

import org.springframework.stereotype.Component
import org.springframework.util.LinkedMultiValueMap
import org.springframework.util.MultiValueMap
import java.util.Base64

@Component
class SpotifyAuthApiClient(metricService: MetricService): SpotifyApiClient(metricService) {

    private val log = LoggerFactory.getLogger(SpotifyAuthApiClient::class.java)

    fun refreshAccessTokenWithRetries(refreshToken: String, maxAttempts: Int = 3): SpotifyTokenDTO {
        var lastException: Exception? = null

        for (attempt in 1..maxAttempts) {
            try {
                return refreshAccessToken(refreshToken)
            } catch (e: Exception) {
                lastException = e
                log.warn("Spotify token refresh failed (attempt $attempt/$maxAttempts): $e")

                if (attempt < maxAttempts) {
                    val waitTimeMs = 1000L * attempt // Exponential backoff
                    log.info("Retrying in ${waitTimeMs}ms")

                    try {
                        Thread.sleep(waitTimeMs)
                    } catch (ie: InterruptedException) {
                        Thread.currentThread().interrupt()
                        throw ie
                    }
                }
            }
        }

        // If all attempts fail, throw the last exception
        throw lastException ?: InternalServerErrorException(
            ErrorCode.UNHANDLED_EXCEPTION,
            "Failed to refresh Spotify access token after $maxAttempts attempts",
            "Unknown error"
        )
    }

    private fun refreshAccessToken(refreshToken: String): SpotifyTokenDTO {
        val authString = getAuthString()

        val bodyFormEncoded: MultiValueMap<String, String> = LinkedMultiValueMap()
        bodyFormEncoded.add("grant_type", "refresh_token")
        bodyFormEncoded.add("refresh_token", refreshToken)

        try {
            sendMetricApiCall("refreshAccessToken")

            val response = authWebClient.post()
                .uri("/token")
                .header("Authorization", "Basic $authString")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .bodyValue(bodyFormEncoded)
                .retrieve()
                .bodyToMono(Map::class.java)
                .block() ?: throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, "Error while calling Spotify API", "Response is null")

            return mapToSpotifyTokenDTO(response, refreshToken)

        } catch (e: Exception) {
            throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, "Error while calling Spotify API", e.toString())
        }
    }

    private fun getAuthString(): String {
        val clientId = System.getenv("SPOTIFY_CLIENT_ID")
        val clientSecret = System.getenv("SPOTIFY_CLIENT_SECRET")

        val authString = "$clientId:$clientSecret"
        val encodedAuthString = Base64.getEncoder().encodeToString(authString.toByteArray())

        return encodedAuthString
    }

    private fun mapToSpotifyTokenDTO(response: Map<*, *>, refreshToken: String): SpotifyTokenDTO {
        return SpotifyTokenDTO(
            accessToken = response["access_token"] as String,
            refreshToken = refreshToken
        )
    }

}