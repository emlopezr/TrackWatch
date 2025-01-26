package com.trackify.backend.controller.contract

import com.trackify.backend.model.core.Artist
import org.springframework.http.ResponseEntity

interface ArtistController {
    fun followArtist(id: String, artist: Artist): ResponseEntity<MutableList<Artist>>
    fun unfollowArtist(id: String, artistId: String): ResponseEntity<MutableList<Artist>>
}