package com.trackwatch.backend.clients.spotify

import com.trackwatch.backend.exception.InternalServerErrorException
import com.trackwatch.backend.model.User
import com.trackwatch.backend.service.MetricService
import com.trackwatch.backend.exception.ErrorCode
import org.springframework.stereotype.Component

@Component
class SpotifyPlaylistApiClient(metricService: MetricService): SpotifyApiClient(metricService) {

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
                .block() ?: throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, "Failed to add tracks to playlist")

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
                    .bodyToMono(Map::class.java)
                    .block() ?: throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, "Failed to get playlist tracks")

                val uris = mapResponseToTrackUris(response)
                trackUris.addAll(uris)
                offset += limit
                val total = (response["total"] as Int?) ?: 0

            } while (offset < total)

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
                    .block() ?: throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, "Failed to check saved tracks")

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
                .block() ?: throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, "Failed to create playlist")

            return response["id"] as String

        } catch (e: Exception) {
            throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, e.toString())
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
                    .block() ?: throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, "Failed to get user playlists")

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

    private fun mapResponseToTrackUris(response: Map<*, *>): List<String> {
        val items = response["items"] as List<*>
        val tracks = items.map { it as Map<*, *> }
        return tracks.map { it["track"] as Map<*, *> }.map { it["uri"] as String }
    }

}