package com.trackify.backend.utils

object ApiEndpoint {
    const val PING = "/ping"
    const val RUN_CORE_TASK = "/run"

    const val USER_CONTROLLER_BASE = "/users"
    const val USER_CONTROLLER_REGISTER = "/register"
    const val USER_CONTROLLER_GET_BY_ID = "/me"

    const val ARTIST_CONTROLLER_BASE = "/artists"
    const val ARTIST_CONTROLLER_FOLLOW = "/follow"
    const val ARTIST_CONTROLLER_UNFOLLOW = "/unfollow"
}