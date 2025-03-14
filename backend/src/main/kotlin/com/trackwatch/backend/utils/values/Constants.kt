package com.trackwatch.backend.utils.values

object Constants {
    const val APP_NAME = "TrackWatch"
    const val DOMAIN = "emlopezr.com"
    const val DEVELOPER = "emlopezr"

    const val FRONTEND_PRODUCTION_DOMAIN = "https://trackwatch.emlopezr.com"
    const val FRONTEND_DEVELOPMENT_DOMAIN = "http://localhost:5173"
    const val GITHUB_USER_PROFILE = "https://github.com/$DEVELOPER"

    const val USER_DB_TABLE = "users"
    const val USER_FOLLOWED_ARTIST_DB_TABLE = "users_followed_artists"
    const val USER_RECENTLY_ADDED_TRACKS_DB_TABLE = "users_recently_added_tracks"

    const val MAX_IN_MEMORY_SIZE = 16 * 1024 * 1024
    const val SERVER_TIMEZONE = "America/Bogota"

    const val PAGES_TO_FETCH = 2
    const val FILTER_DAYS_LIMIT = 2
    const val CLEANUP_DAYS_LIMIT = 4
    const val MAX_LOOP_ITERATION = 19
    const val DEFAULT_WAIT_TIME = 2500L

    const val DEFAULT_PLAYLIST_PRIVACY = true
    const val DEFAULT_PLAYLIST_NAME = "Your $APP_NAME Playlist"
    const val DEFAULT_PLAYLIST_DESCRIPTION = "Your latest releases from your favorite artists - Powered by $APP_NAME"

    const val COLOR_LIGHT_GRAY_1 = "#F7F7F7"
    const val COLOR_LIGHT_GRAY_2 = "#F4F4F4"
    const val COLOR_LIGHT_GRAY_3 = "#DDDDDD"
    const val COLOR_DARK_GRAY = "#333333"
    const val COLOR_WHITE = "#FFFFFF"
    const val COLOR_GREEN = "#49B243"

    private const val ASSETS_BASE_PATH = "https://raw.githubusercontent.com/$DEVELOPER/refs/heads/develop/assets/"
    const val DEFAULT_PLAYLIST_COVER_URL = "${ASSETS_BASE_PATH}default_playlist_cover.png"
    const val DEFAULT_TRACK_IMAGE_URL = "${ASSETS_BASE_PATH}track_placeholder.png"
}