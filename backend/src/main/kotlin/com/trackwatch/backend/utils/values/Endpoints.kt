package com.trackwatch.backend.utils.values

object Endpoints {
    const val PING = "/ping"

    const val ACTIONS_CONTROLLER_BASE = "/actions"
    const val ACTIONS_GENERATE_ARTIST_PLAYLIST = "/generate"
    const val ACTIONS_UPDATE_GET_NEW_RELEASES = "/releases"


    const val USER_CONTROLLER_BASE = "/users"
    const val USER_CONTROLLER_REGISTER = "/register"
    const val USER_CONTROLLER_GET_BY_ID = "/me"

    const val ARTIST_CONTROLLER_BASE = "/artists"
    const val ARTIST_CONTROLLER_FOLLOW = "/follow"
    const val ARTIST_CONTROLLER_UNFOLLOW = "/unfollow"

    const val GENERATOR_CONTROLLER_BASE = "/generator"
    const val GENERATOR_CONTROLLER_ARTIST = "/artist"
}