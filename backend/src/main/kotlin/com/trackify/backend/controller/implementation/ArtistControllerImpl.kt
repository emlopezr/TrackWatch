package com.trackify.backend.controller.implementation

import com.trackify.backend.controller.contract.ArtistController
import com.trackify.backend.model.core.Artist
import com.trackify.backend.service.contract.ArtistService
import com.trackify.backend.service.implementation.UserServiceImpl
import com.trackify.backend.utils.ApiEndpoint
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(ApiEndpoint.ARTIST_CONTROLLER_BASE)
class ArtistControllerImpl(private val artistService: ArtistService): ArtistController {

    // TODO: Add access token validation
    // TODO: Validate Request Body - Check if all fields are present and valid
    @PostMapping(ApiEndpoint.ARTIST_CONTROLLER_FOLLOW)
    override fun followArtist(
        @RequestParam userId: String,
        @RequestBody artist: Artist
    ): ResponseEntity<MutableList<Artist>> {
        val response = artistService.followArtist(userId, artist)
        return ResponseEntity.ok(response)
    }

    // TODO: Add access token validation
    // TODO: Validate that artistId param is present
    @PostMapping(ApiEndpoint.ARTIST_CONTROLLER_UNFOLLOW)
    override fun unfollowArtist(
        @RequestParam userId: String,
        @RequestParam artistId: String
    ): ResponseEntity<MutableList<Artist>> {
        val response = artistService.unfollowArtist(userId, artistId)
        return ResponseEntity.ok(response)
    }
}