package com.trackify.backend.clients.spotify

import com.trackify.backend.model.core.User
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.ExchangeStrategies
import org.springframework.web.reactive.function.client.WebClient

@Component
class SpotifyPlaylistApiClient {

    private val webClient: WebClient = WebClient.builder()
        .exchangeStrategies(configWebClient())
        .baseUrl("https://api.spotify.com/v1").build()

    fun addTracksToPlaylist(user: User, trackUris: List<String>): Map<*, *> {
        val body = mapOf("uris" to trackUris)
        val userPlaylistId = user.playlistId

        try {
            val response = webClient.post()
                .uri("/playlists/$userPlaylistId/tracks")
                .bodyValue(body)
                .header("Authorization", "Bearer ${user.auth.current.accessToken}")
                .retrieve()
                .bodyToMono(Map::class.java)
                .block() ?: throw RuntimeException("Failed to add tracks to playlist")
            return response
        } catch (e: Exception) {
            throw RuntimeException(e)
        }
    }

    fun getPlaylistTracks(user: User): List<String> {
        val userPlaylistId = user.playlistId
        val trackUris = mutableListOf<String>()
        var offset = 0
        val limit = 100

        try {
            do {
                val response = webClient.get()
                    .uri { uriBuilder ->
                        uriBuilder.path("/playlists/$userPlaylistId/tracks")
                            .queryParam("limit", limit)
                            .queryParam("offset", offset)
                            .build()
                    }
                    .header("Authorization", "Bearer ${user.auth.current.accessToken}")
                    .retrieve()
                    .bodyToMono(Map::class.java)
                    .block() ?: throw RuntimeException("Failed to get playlist tracks")

                val uris = mapResponseToTrackUris(response)
                trackUris.addAll(uris)
                offset += limit

                val total = (response["total"] as Int?) ?: 0
            } while (offset < total)

            return trackUris
        } catch (e: Exception) {
            throw RuntimeException(e)
        }
    }

    fun filterSavedTracks(user: User, uris: Set<String>): Set<String> {
        val ids = uris.map { it.split(":").last() }
        val filteredUris = mutableSetOf<String>()
        val limit = 50

        try {
            ids.chunked(limit).forEach { chunk ->
                val idsParam = chunk.joinToString(",")
                val response = webClient.get()
                    .uri { uriBuilder ->
                        uriBuilder.path("/me/tracks/contains")
                            .queryParam("ids", idsParam)
                            .build()
                    }
                    .header("Authorization", "Bearer ${user.auth.current.accessToken}")
                    .retrieve()
                    .bodyToMono(List::class.java)
                    .block() ?: throw RuntimeException("Failed to check saved tracks")

                val savedStatuses = response as List<Boolean>

                chunk.forEachIndexed { index, id ->
                    if (!savedStatuses[index]) {
                        filteredUris.add("spotify:track:$id")
                    }
                }
            }
        } catch (e: Exception) {
            throw RuntimeException(e)
        }

        return filteredUris
    }

    private fun mapResponseToTrackUris(response: Map<*, *>): List<String> {
        val items = response["items"] as List<*>
        val tracks = items.map { it as Map<*, *> }
        return tracks.map { it["track"] as Map<*, *> }.map { it["uri"] as String }
    }

    private fun configWebClient(): ExchangeStrategies {
        return ExchangeStrategies.builder()
            .codecs { configurer -> configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024) }
            .build()
    }
}