package com.trackwatch.backend.clients.spotify

import com.trackwatch.backend.exception.InternalServerErrorException
import com.trackwatch.backend.model.Artist
import com.trackwatch.backend.model.Track
import com.trackwatch.backend.model.TrackImage
import com.trackwatch.backend.utils.service.MetricService
import com.trackwatch.backend.utils.values.ErrorCode
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClientResponseException
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

@Component
class SpotifyArtistApiClient(metricService: MetricService): SpotifyApiClient(metricService) {

    private val log = LoggerFactory.getLogger(SpotifyArtistApiClient::class.java)

    fun getArtistInfo(artistId: String, accessToken: String): Artist {
        try {
            sendMetricApiCall("getArtistInfo")

            val response = webClient.get()
                .uri("/artists/$artistId")
                .header("Authorization", "Bearer $accessToken")
                .retrieve()
                .bodyToMono(Map::class.java)
                .block() ?: throw RuntimeException("No data returned from Spotify API")

            return parseArtistInfo(response)

        } catch (e: WebClientResponseException) {
            throw RuntimeException("Error while calling Spotify API: ${e.message}")

        } catch (e: Exception) {
            throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, "Error while calling Spotify API", e.toString())
        }
    }

    fun getArtistNewTracksWithRetries(artist: Artist, accessToken: String, daysLimit: Int?, page: Int, maxAttempts: Int = 3): List<Track> {
        var lastException: Exception? = null

        for (attempt in 1..maxAttempts) {
            try {
                return getArtistNewTracks(artist, accessToken, daysLimit, page)

            } catch (e: Exception) {
                lastException = e
                log.warn("Spotify API call failed (attempt $attempt/$maxAttempts): $e")

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

        if (lastException is WebClientResponseException) {
            throw RuntimeException("Error while calling Spotify API after $maxAttempts attempts: ${lastException.message}")
        }

        throw InternalServerErrorException(
            ErrorCode.UNHANDLED_EXCEPTION,
            "Error while calling Spotify API after $maxAttempts attempts",
            lastException?.toString() ?: ""
        )
    }

    private fun getArtistNewTracks(artist: Artist, accessToken: String, daysLimit: Int?, page: Int): List<Track> {
        val queryParams = buildQueryParams(artist.name, daysLimit, page)

        try {
            sendMetricApiCall("getArtistNewTracks")

            val response = webClient.get()
                .uri("/search?$queryParams")
                .header("Authorization", "Bearer $accessToken")
                .retrieve()
                .bodyToMono(Map::class.java)
                .block() ?: return emptyList()

            return parseTracks(response)

        } catch (e: WebClientResponseException) {
            throw RuntimeException("Error while calling Spotify API: ${e.message}")

        } catch (e: Exception) {
            throw InternalServerErrorException(ErrorCode.UNHANDLED_EXCEPTION, "Error while calling Spotify API", e.toString())
        }
    }

    private fun parseTracks(response: Map<*, *>): List<Track> {
        val tracks = response["tracks"] as Map<*, *>
        val items = tracks["items"] as List<*>

        val parsedTracks = mutableListOf<Track>()

        items.forEach { item ->
            val mapTrack = item as Map<*, *>

            val artists = mapTrack["artists"] as List<*>
            val album = mapTrack["album"] as Map<*, *>

            val releaseDateString = album["release_date"] as String
            val releaseDatePrecision = album["release_date_precision"] as String
            val releaseDate = formatReleaseDate(releaseDateString, releaseDatePrecision)

            val track = Track(
                id = mapTrack["id"] as String,
                uri = mapTrack["uri"] as String,
                name = mapTrack["name"] as String,
                artists = parseArtists(artists),
                releaseDate = releaseDate,
                isExplicit = mapTrack["explicit"] as Boolean,
                albumName= album["name"] as String,
                albumImages = parseAlbumImages(album),
                albumType = album["album_type"] as String,
                discNumber = mapTrack["disc_number"] as Int,
                albumOrder = mapTrack["track_number"] as Int,
                durationMs = mapTrack["duration_ms"] as Int
            )

            parsedTracks.add(track)
        }

        return parsedTracks
    }

    private fun formatReleaseDate(releaseDateString: String, releaseDatePrecision: String): Date {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

        val releaseDate = when (releaseDatePrecision) {
            "year" -> {
                val year = releaseDateString.substring(0, 4)
                dateFormat.parse("$year-01-01")
            }
            "month" -> {
                val year = releaseDateString.substring(0, 4)
                val month = releaseDateString.substring(5, 7)
                dateFormat.parse("$year-$month-01")
            }
            "day" -> {
                dateFormat.parse(releaseDateString)
            }
            else -> throw RuntimeException("Invalid release date precision: $releaseDatePrecision")
        }

        return releaseDate
    }

    private fun parseArtists(dataArtists: List<*>): List<Artist> {
        val parsedArtists = mutableListOf<Artist>()

        dataArtists.forEach { dataArtist ->
            val mapArtist = dataArtist as Map<*, *>

            val artist = Artist(
                id = mapArtist["id"] as String,
                name = mapArtist["name"] as String
            )

            parsedArtists.add(artist)
        }

        return parsedArtists
    }

    private fun parseAlbumImages(dataAlbum: Map<*, *>): List<TrackImage> {
        val parsedAlbumImages = mutableListOf<TrackImage>()

        val images = dataAlbum["images"] as List<*>

        images.forEach { dataImage ->
            val mapImage = dataImage as Map<*, *>

            val image = TrackImage(
                url = mapImage["url"] as String,
                width = mapImage["width"] as Int,
                height = mapImage["height"] as Int
            )

            parsedAlbumImages.add(image)
        }

        return parsedAlbumImages
    }

    private fun buildQueryParams(artistName: String, daysLimit: Int?, page: Int): String {
        val q = buildQuery(artistName, daysLimit)
        val type = "track"
        val limit = 50
        val offset = page * 50

        return "q=$q&type=$type&limit=$limit&offset=$offset"
    }

    private fun buildQuery(artistName: String, daysLimit: Int?): String {

        if (daysLimit == null) {
            return "artist:${artistName}"
        }

        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val today = Date()
        val todayIso = dateFormat.format(today)

        val calendar = Calendar.getInstance()
        calendar.time = today
        calendar.add(Calendar.DAY_OF_YEAR, - daysLimit)

        val startDate = calendar.time
        val startDateIso = dateFormat.format(startDate)

        var searchQuery = "artist:${artistName}"

        // if start_date.year == today.year
        searchQuery += if (startDateIso.substring(0, 4) == todayIso.substring(0, 4)) {
            " year:${startDateIso.substring(0, 4)}"
        } else {
            " year:${startDateIso.substring(0, 4)}-${todayIso.substring(0, 4)}"
        }

        return searchQuery
    }

    fun parseArtistInfo(response: Map<*, *>): Artist {
        val images = response["images"] as List<*>
        val imageUrl = (images.firstOrNull() as? Map<*, *>)?.get("url") as? String ?: ""

        return Artist(
            id = response["id"] as String,
            name = response["name"] as String,
            imageUrl = imageUrl
        )
    }

}