package com.trackwatch.backend.service

import com.trackwatch.backend.clients.spotify.SpotifyArtistApiClient
import com.trackwatch.backend.model.Artist
import com.trackwatch.backend.model.Track
import com.trackwatch.backend.model.User
import com.trackwatch.backend.utils.values.Constants
import org.springframework.stereotype.Service
import java.util.*
import kotlin.math.abs

@Service
class TrackService(private val spotifyArtistApiClient: SpotifyArtistApiClient) {

    fun searchArtistTracks(
        artist: Artist,
        accessToken: String,
        pagesToFetch: Int,
        daysLimit: Int = Constants.FILTER_DAYS_LIMIT
    ): List<Track> {
        val newTracks = mutableListOf<Track>()

        for (page in 0 until pagesToFetch) {
            val pageNewTracks =
                spotifyArtistApiClient.searchArtistTracksWithRetries(artist, accessToken, daysLimit, page)
            newTracks.addAll(pageNewTracks)
        }

        return newTracks
    }

    fun filterTrack(
        track: Track,
        user: User,
        artist: Artist,
        tracksToAdd: MutableSet<Track>,
        daysLimit: Int = Constants.FILTER_DAYS_LIMIT,
        shouldCheckCorrectArtist: Boolean = true,
        shouldCheckTrackInTimeRange: Boolean = true,
        shouldCheckCompilationAlbum: Boolean = true,
        shouldCheckSongBlockedByUserSettings: Boolean = true,
        shouldCheckTrackRecentlyAdded: Boolean = false
    ): Track? {
        val calendar = Calendar.getInstance(TimeZone.getTimeZone(Constants.SERVER_TIMEZONE))
        val today = calendar.time

        calendar.add(Calendar.DAY_OF_YEAR, -daysLimit)
        val startDate = calendar.time

        val isCorrectArtist = !shouldCheckCorrectArtist || isCorrectArtist(track, artist)
        val isTrackInTimeRange = !shouldCheckTrackInTimeRange || isTrackInTimeRange(track, startDate, today)
        val isCompilationAlbum = shouldCheckCompilationAlbum && isCompilationAlbum(track)
        val isSongBlockedByUserSettings =
            shouldCheckSongBlockedByUserSettings && isSongBlockedByUserSettings(track, user)
        val isTrackRecentlyAdded = shouldCheckTrackRecentlyAdded && isTrackRecentlyAdded(user, track)

        if (
            isCorrectArtist &&
            isTrackInTimeRange &&
            !isCompilationAlbum &&
            !isSongBlockedByUserSettings &&
            !isTrackRecentlyAdded
        ) {
            val selectedTrack = selectTrack(track, tracksToAdd)
            if (isSameTrackInList(selectedTrack, tracksToAdd)) {
                return null
            }
            tracksToAdd.add(selectedTrack)
            return selectedTrack
        }

        return null
    }

    fun sortTracks(tracks: Set<Track>): Set<Track> {
        val sortedList = tracks.sortedWith(
            compareBy(
                { it.releaseDate },
                { it.albumName },
                { it.discNumber },
                { it.albumOrder })
        )
        return sortedList.toSet()
    }

    fun removeDuplicateTracks(tracks: List<Track>): List<Track> {
        val uniqueTracks = mutableListOf<Track>()
        val processedTracks = mutableMapOf<String, Track>()

        for (track in tracks) {
            val baseSignature = generateTrackSignatureWithoutDuration(track)

            if (processedTracks.containsKey(baseSignature)) {
                val existingTrack = processedTracks[baseSignature]!!
                val durationDifference = abs(track.durationMs - existingTrack.durationMs)

                // If duration differs by more than 1000ms (1 second), consider it a different track
                if (durationDifference > 1000) {
                    val uniqueSignature = "$baseSignature|${track.durationMs}"
                    processedTracks[uniqueSignature] = track
                    uniqueTracks.add(track)
                }
            } else {
                processedTracks[baseSignature] = track
                uniqueTracks.add(track)
            }
        }

        return uniqueTracks
    }

    private fun generateTrackSignatureWithoutDuration(track: Track): String {
        val normalizedName = track.name.lowercase()
        val artistsSignature = track.artists
            .map { it.name.lowercase() }
            .sorted()
            .joinToString(",")

        return "$normalizedName|$artistsSignature"
    }

    fun isCorrectArtist(track: Track, artist: Artist): Boolean {
        return track.artists.any { it.id == artist.id }
    }

    fun isTrackInTimeRange(track: Track, startDate: Date, endDate: Date): Boolean {
        return track.releaseDate in startDate..endDate
    }

    fun isCompilationAlbum(track: Track): Boolean {
        return track.albumType == "compilation"
    }

    fun isSongBlockedByUserSettings(track: Track, user: User): Boolean {
        return user.settings.blockedExplicitContent && track.isExplicit
    }

    private fun selectTrack(track: Track, tracksToAdd: Set<Track>): Track {
        val equalTrack = tracksToAdd.find { it.isEqualTo(track) }
        if (equalTrack == null) {
            return track
        }

        var selectedTrack = track
        var nonSelectedTrack = equalTrack

        // Prefer album tracks over single tracks
        if (selectedTrack.albumType == "single" && equalTrack.albumType == "album") {
            selectedTrack = equalTrack
            nonSelectedTrack = track
        }

        // Prefer explicit tracks over non-explicit tracks
        if (!selectedTrack.isExplicit && nonSelectedTrack.isExplicit) {
            selectedTrack = nonSelectedTrack
        }

        return selectedTrack
    }

    private fun isSameTrackInList(track: Track, tracks: Set<Track>): Boolean {
        return tracks.any { it.isEqualStrict(track) }
    }

    private fun isTrackRecentlyAdded(user: User, track: Track): Boolean {
        val recentlyAddedTracks = user.recentlyAddedTracks
        return recentlyAddedTracks.any { it.isEqualToTrack(track) }
    }

}