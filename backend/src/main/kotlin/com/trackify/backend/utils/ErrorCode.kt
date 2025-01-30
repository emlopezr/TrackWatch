package com.trackify.backend.utils

enum class ErrorCode(val description: String) {
    UNHANDLED_EXCEPTION("Unhandled exception"),
    USER_NOT_FOUND("User not found"),
    USER_ALREADY_EXISTS("User already exists"),
    USER_INVALID_CREDENTIALS("Invalid user credentials"),
    SPOTIFY_INVALID_ACCESS_TOKEN("Invalid Spotify access token"),
    SPOTIFY_FORBIDDEN_REQUEST("Spotify API request forbidden request"),
    SPOTIFY_USER_NOT_FOUND("Spotify user not found")
    ;
}