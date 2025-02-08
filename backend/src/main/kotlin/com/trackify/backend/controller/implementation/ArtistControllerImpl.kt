package com.trackify.backend.controller.implementation

import com.trackify.backend.controller.contract.ArtistController
import com.trackify.backend.model.core.Artist
import com.trackify.backend.service.contract.ArtistService
import com.trackify.backend.utils.ApiEndpoint
import com.trackify.backend.utils.ApiMetric
import com.trackify.backend.utils.CustomHeader
import com.trackify.backend.utils.MetricService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(ApiEndpoint.ARTIST_CONTROLLER_BASE)
class ArtistControllerImpl(
    private val metricService: MetricService,
    private val artistService: ArtistService
): ArtistController {

    // TODO: Add access token validation
    // TODO: Validate Request Body DTO
    @PostMapping(ApiEndpoint.ARTIST_CONTROLLER_FOLLOW)
    override fun followArtist(
        @RequestParam userId: String,
        @RequestBody artist: Artist,
        @RequestHeader(CustomHeader.ACCESS_TOKEN) accessToken: String
    ): ResponseEntity<MutableList<Artist>> {

        metricService.incrementCounter(ApiMetric.REST_REQUEST,
            "controller", "ArtistController",
            "endpoint", ApiEndpoint.ARTIST_CONTROLLER_FOLLOW,
            "method", "POST"
        )

        val response = artistService.followArtist(userId, artist, accessToken)
        return ResponseEntity.ok(response)
    }

    // TODO: Add access token validation
    // TODO: Validate Request Body DTO
    @PostMapping(ApiEndpoint.ARTIST_CONTROLLER_UNFOLLOW)
    override fun unfollowArtist(
        @RequestParam userId: String,
        @RequestParam artistId: String,
        @RequestHeader(CustomHeader.ACCESS_TOKEN) accessToken: String
    ): ResponseEntity<MutableList<Artist>> {

        metricService.incrementCounter(ApiMetric.REST_REQUEST,
            "controller", "ArtistController",
            "endpoint", ApiEndpoint.ARTIST_CONTROLLER_UNFOLLOW,
            "method", "POST"
        )

        val response = artistService.unfollowArtist(userId, artistId, accessToken)
        return ResponseEntity.ok(response)
    }
}