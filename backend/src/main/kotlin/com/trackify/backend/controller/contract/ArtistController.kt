package com.trackify.backend.controller.contract

import com.trackify.backend.model.core.Artist
import org.springframework.http.ResponseEntity

interface ArtistController {
    fun followArtist(userId: String, artist: Artist): ResponseEntity<MutableList<Artist>>
    fun unfollowArtist(userId: String, artistId: String): ResponseEntity<MutableList<Artist>>
}