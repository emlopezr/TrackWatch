package com.trackwatch.backend.clients.spotify

import com.trackwatch.backend.clients.spotify.dto.SpotifyPlaylistTracksResponse
import com.trackwatch.backend.exception.ErrorCode
import com.trackwatch.backend.exception.InternalServerErrorException
import com.trackwatch.backend.model.User
import com.trackwatch.backend.service.MetricService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

@Component
class SpotifyPlaylistApiClient(metricService: MetricService) : SpotifyApiClient(metricService) {

    private val log = LoggerFactory.getLogger(this::class.java)

    fun addTracksToPlaylist(user: User, playlistId: String, trackUris: List<String>): Map<*, *> {
        val body = mapOf("uris" to trackUris)

        try {
            sendMetricApiCall("addTracksToPlaylist")

            val response = webClient.post()
                .uri("/playlists/$playlistId/tracks")
                .bodyValue(body)
                .header("Authorization", "Bearer ${user.auth.current.accessToken}")
                .retrieve()
                .bodyToMono(Map::class.java)
                .block() ?: throw InternalServerErrorException(
                ErrorCode.UNHANDLED_EXCEPTION,
                "Failed to add tracks to playlist"
            )

            return response

        } catch (e: Exception) {
            throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, e.toString())
        }
    }

    fun getPlaylistTracks(user: User, playlistId: String): List<String> {
        val trackUris = mutableListOf<String>()
        var offset = 0
        val limit = 100

        try {
            do {
                sendMetricApiCall("getPlaylistTracks")

                val response = webClient.get()
                    .uri { uriBuilder ->
                        uriBuilder.path("/playlists/$playlistId/tracks")
                            .queryParam("limit", limit)
                            .queryParam("offset", offset)
                            .build()
                    }
                    .header("Authorization", "Bearer ${user.auth.current.accessToken}")
                    .retrieve()
                    .bodyToMono(SpotifyPlaylistTracksResponse::class.java)
                    .block() ?: throw InternalServerErrorException(
                    ErrorCode.UNHANDLED_EXCEPTION,
                    "Failed to get playlist tracks"
                )

                val uris = mapResponseToTrackUris(response)
                trackUris.addAll(uris)
                offset += limit

            } while (offset < response.total)

            return trackUris

        } catch (e: Exception) {
            throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, e.toString())
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
                    .block() ?: throw InternalServerErrorException(
                    ErrorCode.UNHANDLED_EXCEPTION,
                    "Failed to check saved tracks"
                )

                val savedStatuses = response as List<Boolean>

                chunk.forEachIndexed { index, id ->
                    if (!savedStatuses[index]) {
                        filteredUris.add("spotify:track:$id")
                    }
                }
            }

        } catch (e: Exception) {
            throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, e.toString())
        }

        return filteredUris
    }

    fun createPlaylist(user: User, name: String, description: String, isPublic: Boolean): String {
        val body = mapOf(
            "name" to name,
            "description" to description,
            "public" to isPublic
        )

        try {
            sendMetricApiCall("createPlaylist")

            val response = webClient.post()
                .uri("/users/${user.id}/playlists")
                .bodyValue(body)
                .header("Authorization", "Bearer ${user.auth.current.accessToken}")
                .retrieve()
                .bodyToMono(Map::class.java)
                .block() ?: throw InternalServerErrorException(
                ErrorCode.UNHANDLED_EXCEPTION,
                "Failed to create playlist"
            )

            return response["id"] as String

        } catch (e: Exception) {
            throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, e.toString())
        }
    }

    fun checkPlaylistExistsWithRetries(user: User, maxRetries: Int = 5, delayMs: Long = 500): Boolean {
        repeat(maxRetries) {
            if (checkPlaylistExists(user)) return true
            Thread.sleep(delayMs)
        }

        return false
    }

    fun checkPlaylistExists(user: User): Boolean {
        val userPlaylistId = user.playlistId

        var offset = 0
        val limit = 50

        val allPlaylists = mutableListOf<Map<String, Any>>()

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
                    .block() ?: throw InternalServerErrorException(
                    ErrorCode.UNHANDLED_EXCEPTION,
                    "Failed to get user playlists"
                )

                val items = response["items"] as List<*>
                collectPlaylistItems(items, allPlaylists)

                val playlistIds = items.map { (it as Map<*, *>)["id"] as String }
                if (playlistIds.contains(userPlaylistId)) return true

                offset += limit
                val total = (response["total"] as Int?) ?: 0
            } while (offset < total)

            logAvailablePlaylists(userPlaylistId, allPlaylists)
            return false
        } catch (e: Exception) {
            throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, e.toString())
        }
    }

    fun updatePlaylistCover(user: User, playlistId: String, imageBase64: String) {
        try {
            sendMetricApiCall("updatePlaylistCover")

            webClient.put()
                .uri("/playlists/$playlistId/images")
                .header("Authorization", "Bearer ${user.auth.current.accessToken}")
                .header("Content-Type", "image/jpeg")
                .bodyValue(imageBase64)
                .retrieve()
                .bodyToMono(Void::class.java)
                .block()

        } catch (e: Exception) {
            throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, e.toString())
        }
    }

    private fun collectPlaylistItems(items: List<*>, allPlaylists: MutableList<Map<String, Any>>) {
        items.forEach {
            val playlist = it as Map<*, *>
            allPlaylists.add(mapOf(
                "id" to (playlist["id"] as String),
                "name" to (playlist["name"] as String)
            ))
        }
    }

    private fun mapResponseToTrackUris(response: SpotifyPlaylistTracksResponse): List<String> {
        return response.items.mapNotNull { it.track?.uri }
    }

    private fun logAvailablePlaylists(searchedPlaylistId: String, playlists: List<Map<String, Any>>) {
        log.info("Playlist with ID: $searchedPlaylistId not found. Available playlists:")
        playlists.forEach { playlist ->
            log.info("ID: ${playlist["id"]}, Name: ${playlist["name"]}")
        }
    }

}