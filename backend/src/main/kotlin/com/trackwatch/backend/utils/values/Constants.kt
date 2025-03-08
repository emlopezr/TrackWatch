package com.trackwatch.backend.utils.values

object Constants {
    const val USER_DB_TABLE = "users"
    const val USER_FOLLOWED_ARTIST_DB_TABLE = "users_followed_artists"

    const val MAX_IN_MEMORY_SIZE = 16 * 1024 * 1024
    const val SERVER_TIMEZONE = "America/Bogota"

    const val PAGES_TO_FETCH = 2
    const val FILTER_DAYS_LIMIT = 2
    const val MAX_LOOP_ITERATION = 19
    const val DEFAULT_WAIT_TIME = 2500L

    const val DEFAULT_PLAYLIST_PRIVACY = true
    const val DEFAULT_PLAYLIST_NAME = "Your TrackWatch Playlist"
    const val DEFAULT_PLAYLIST_DESCRIPTION = "Your latest releases from your favorite artists - Powered by TrackWatch"

    const val EMAIL_GREEN = "#49b243"

    const val DEFAULT_TRACK_IMAGE_URL = "https://raw.githubusercontent.com/emlopezr/TrackWatch/refs/heads/develop/assets/track_placeholder.png"
    const val DEFAULT_PLAYLIST_COVER_URL = "https://raw.githubusercontent.com/emlopezr/TrackWatch/refs/heads/develop/assets/default_playlist_cover.png"
}