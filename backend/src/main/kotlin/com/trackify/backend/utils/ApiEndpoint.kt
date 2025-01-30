package com.trackify.backend.utils

object ApiEndpoint {
    const val USER_CONTROLLER_BASE = "/users"
    const val USER_CONTROLLER_REGISTER = "/register"
    const val USER_CONTROLLER_GET_BY_ID = "/{userId}"

    const val ARTIST_CONTROLLER_BASE = "/artists"
    const val ARTIST_CONTROLLER_FOLLOW = "/follow"
    const val ARTIST_CONTROLLER_UNFOLLOW = "/unfollow"
}