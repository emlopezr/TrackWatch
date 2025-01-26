package com.trackify.backend.model.core.user

data class UserAuth(
    val accessToken: String,
    val refreshToken: String
)