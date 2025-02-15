package com.trackify.backend.service

import com.trackify.backend.clients.spotify.SpotifyArtistApiClient
import com.trackify.backend.model.Artist
import com.trackify.backend.model.Track
import com.trackify.backend.model.User
import com.trackify.backend.utils.values.Constants
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.util.Calendar
import java.util.Date

@Service
class TrackService(private val spotifyArtistApiClient: SpotifyArtistApiClient) {

    val log = LoggerFactory.getLogger(TrackService::class.java)

    val daysLimit = Constants.DAYS_LIMIT

    fun getArtistNewTracks(artist: Artist, accessToken: String, pagesToFetch: Int): List<Track> {
        val newTracks = mutableListOf<Track>()

        for (page in 0 until pagesToFetch) {
            log.info("Fetching page $page of new tracks for artist ${artist.name}")
            val pageNewTracks = spotifyArtistApiClient.getArtistNewTracks(artist, accessToken, daysLimit, page)
            newTracks.addAll(pageNewTracks)
        }

        log.info("Fetched ${newTracks.size} new tracks for artist ${artist.name}")
        return newTracks
    }

    fun filterTrack(track: Track, user: User, artist: Artist, tracksToAdd: MutableSet<Track>): Track? {
        val today = Date()

        val calendar = Calendar.getInstance()
        calendar.time = today
        calendar.add(Calendar.DAY_OF_YEAR, -daysLimit)
        val startDate = calendar.time

        val isCorrectArtist = isCorrectArtist(track, artist)
        val isTrackInTimeRange = isTrackInTimeRange(track, startDate, today)
        val isCompilationAlbum = isCompilationAlbum(track)
        val isSongBlockedByUserSettings = isSongBlockedByUserSettings(track, user)

        if (isCorrectArtist && isTrackInTimeRange && !isCompilationAlbum && !isSongBlockedByUserSettings) {
            val selectedTrack = selectTrack(track, tracksToAdd)

            if (isExactlyTheSameTrackInList(selectedTrack, tracksToAdd)) {
                return null
            }

            tracksToAdd.add(selectedTrack)
            return selectedTrack
        }

        log.info("Track ${track.name} by ${track.artists.first().name} was filtered out")
        return null
    }

    fun sortTracks(tracks: Set<Track>): Set<Track> {
        val sortedList = tracks.sortedWith(compareBy(
            { it.releaseDate },
            { it.albumName },
            { it.discNumber },
            { it.albumOrder })
        )
        return sortedList.toSet()
    }

    private fun isCorrectArtist(track: Track, artist: Artist): Boolean {
        return track.artists.any { it.id == artist.id }
    }

    private fun isTrackInTimeRange(track: Track, startDate: Date, endDate: Date): Boolean {
        return track.releaseDate in startDate..endDate
    }

    private fun isCompilationAlbum(track: Track): Boolean {
        return track.albumType == "compilation"
    }

    private fun isSongBlockedByUserSettings(track: Track, user: User): Boolean {
        return user.settings.blockedExplicitContent && track.isExplicit
    }

    private fun selectTrack(track: Track, tracksToAdd: Set<Track>): Track {
        val equalTrack = tracksToAdd.find { it.isEqualTo(track) }
        if (equalTrack == null) {  return track  }

        var selectedTrack = track
        var nonSelectedTrack = equalTrack

        // Prefer album tracks over single tracks
        if (selectedTrack.albumType == "single" && equalTrack.albumType == "album") {
            selectedTrack = equalTrack
            nonSelectedTrack = track
        }

        // Prefer explicit tracks over non-explicit tracks
        if (!selectedTrack.isExplicit && nonSelectedTrack!!.isExplicit) {
            selectedTrack = nonSelectedTrack
        }

        return selectedTrack
    }

    private fun isExactlyTheSameTrackInList(track: Track, tracks: Set<Track>): Boolean {
        return tracks.any { it.isExactlyEqual(track) }
    }

}