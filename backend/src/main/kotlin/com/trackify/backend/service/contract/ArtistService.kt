package com.trackify.backend.service.contract

import com.trackify.backend.model.core.Artist

interface ArtistService {
    fun followArtist(userId: String, artist: Artist, accessToken: String): MutableList<Artist>
    fun unfollowArtist(userId: String, artistId: String, accessToken: String): MutableList<Artist>
}