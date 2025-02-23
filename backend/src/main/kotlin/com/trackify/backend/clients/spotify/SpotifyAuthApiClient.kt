package com.trackify.backend.clients.spotify

import com.trackify.backend.clients.spotify.dto.SpotifyTokenDTO
import com.trackify.backend.exception.*
import com.trackify.backend.utils.values.ErrorCode
import com.trackify.backend.utils.service.MetricService

import org.springframework.stereotype.Component
import org.springframework.util.LinkedMultiValueMap
import org.springframework.util.MultiValueMap
import java.util.Base64

@Component
class SpotifyAuthApiClient(metricService: MetricService): SpotifyApiClient(metricService) {

    fun refreshAccessToken(refreshToken: String): SpotifyTokenDTO {
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