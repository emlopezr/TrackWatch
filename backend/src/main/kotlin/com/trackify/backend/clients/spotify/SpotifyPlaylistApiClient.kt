package com.trackify.backend.clients.spotify

import com.trackify.backend.model.core.User
import com.trackify.backend.utils.ApiMetric
import com.trackify.backend.utils.Constants
import com.trackify.backend.utils.MetricService
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.ExchangeStrategies
import org.springframework.web.reactive.function.client.WebClient

@Component
class SpotifyPlaylistApiClient(private val metricService: MetricService) {

    private val webClient: WebClient = WebClient.builder()
        .exchangeStrategies(configWebClient())
        .baseUrl("https://api.spotify.com/v1").build()

    fun addTracksToPlaylist(user: User, trackUris: List<String>): Map<*, *> {
        val body = mapOf("uris" to trackUris)
        val userPlaylistId = user.playlistId

        try {
            sendMetricApiCall("addTracksToPlaylist")
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
                sendMetricApiCall("getPlaylistTracks")
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

                sendMetricApiCall("filterSavedTracks")
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

    fun createPlaylist(user: User): User {
        val body = mapOf(
            "name" to "Your Trackify Playlist",
            "description" to "Your latest releases from your favorite artists - Powered by Trackify",
            "public" to false
        )

        try {
            sendMetricApiCall("createPlaylist")
            val response = webClient.post()
                .uri("/users/${user.id}/playlists")
                .bodyValue(body)
                .header("Authorization", "Bearer ${user.auth.current.accessToken}")
                .retrieve()
                .bodyToMono(Map::class.java)
                .block() ?: throw RuntimeException("Failed to create playlist")

            val playlistId = response["id"] as String
            user.playlistId = playlistId

            return user
        } catch (e: Exception) {
            throw RuntimeException(e)
        }
    }

    fun checkPlaylistExists(user: User): Boolean {
        val userPlaylistId = user.playlistId
        var offset = 0
        val limit = 50

        try {
            do {
                sendMetricApiCall("checkPlaylistExists")
                val response = webClient.get()
                    .uri { uriBuilder ->
                        uriBuilder.path("/me/playlists")
                            .queryParam("limit", limit)
                            .queryParam("offset", offset)
                            .build()
                    }
                    .header("Authorization", "Bearer ${user.auth.current.accessToken}")
                    .retrieve()
                    .bodyToMono(Map::class.java)
                    .block() ?: throw RuntimeException("Failed to get user playlists")

                val items = response["items"] as List<*>
                val playlistIds = items.map { (it as Map<*, *>)["id"] as String }

                if (playlistIds.contains(userPlaylistId)) {
                    return true
                }

                offset += limit
                val total = (response["total"] as Int?) ?: 0
            } while (offset < total)

            return false
        } catch (e: Exception) {
            throw RuntimeException(e)
        }
    }

    private fun mapResponseToTrackUris(response: Map<*, *>): List<String> {
        val items = response["items"] as List<*>
        val tracks = items.map { it as Map<*, *> }
        return tracks.map { it["track"] as Map<*, *> }.map { it["uri"] as String }
    }

    private fun configWebClient(): ExchangeStrategies {
        return ExchangeStrategies.builder()
            .codecs { configurer -> configurer.defaultCodecs().maxInMemorySize(Constants.MAX_IN_MEMORY_SIZE) }
            .build()
    }

    private fun sendMetricApiCall(method: String) {
        metricService.incrementCounter(ApiMetric.CLIENT_REQUEST,
            "client", this.javaClass.simpleName,
            "method", method
        )
    }
}