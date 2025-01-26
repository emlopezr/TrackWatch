package com.trackify.backend.controller.implementation

import com.trackify.backend.controller.contract.ArtistController
import com.trackify.backend.model.core.Artist
import com.trackify.backend.service.implementation.UserServiceImpl
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/artists")
class ArtistControllerImpl(private val userService: UserServiceImpl): ArtistController {

    // TODO: Migrate to ArtistController - Getting user by Auth token
    // TODO: Exception handling - Maybe have a class that handles all exceptions
    // TODO: Validate Request Body - Check if all fields are present and valid
    @PostMapping("/{id}/follow")
    override fun followArtist(
        @PathVariable id: String,
        @RequestBody artist: Artist
    ): ResponseEntity<MutableList<Artist>> {
//        try {
//            val response = userService.followArtist(id, artist.id, artist.name)
//            return ResponseEntity.ok(response)
//        } catch (e: Exception) {
//            return ResponseEntity.badRequest().build()
//        }
        TODO()
    }

    // TODO: Migrate to ArtistController - Getting user by Auth token
    // TODO: Exception handling - Maybe have a class that handles all exceptions
    // TODO: Validate that artistId param is present
    @PostMapping("/{id}/unfollow")
    override fun unfollowArtist(
        @PathVariable id: String,
        @RequestParam("artist_id") artistId: String
    ): ResponseEntity<MutableList<Artist>> {
//        try {
//            val response = userService.unfollowArtist(id, artistId)
//            return ResponseEntity.ok(response)
//        } catch (e: Exception) {
//            return ResponseEntity.badRequest().build()
//        }
        TODO()
    }
}