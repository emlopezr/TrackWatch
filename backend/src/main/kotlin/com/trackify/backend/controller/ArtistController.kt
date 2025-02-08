package com.trackify.backend.controller

import com.trackify.backend.model.core.Artist
import com.trackify.backend.service.ArtistService
import com.trackify.backend.utils.values.Endpoints
import com.trackify.backend.utils.values.Metrics
import com.trackify.backend.utils.values.Headers
import com.trackify.backend.utils.service.MetricService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(Endpoints.ARTIST_CONTROLLER_BASE)
class ArtistController(
    private val artistService: ArtistService,
    metricService: MetricService
): BaseController(metricService) {

    @PostMapping(Endpoints.ARTIST_CONTROLLER_FOLLOW)
    fun followArtist(
        @RequestParam userId: String,
        @RequestBody artist: Artist,
        @RequestHeader(Headers.ACCESS_TOKEN) accessToken: String
    ): ResponseEntity<MutableList<Artist>> {
        sendMetricRequest(Endpoints.ARTIST_CONTROLLER_FOLLOW, "POST")
        val response = artistService.followArtist(userId, artist, accessToken)
        return ResponseEntity.ok(response)
    }

    @PostMapping(Endpoints.ARTIST_CONTROLLER_UNFOLLOW)
    fun unfollowArtist(
        @RequestParam userId: String,
        @RequestParam artistId: String,
        @RequestHeader(Headers.ACCESS_TOKEN) accessToken: String
    ): ResponseEntity<MutableList<Artist>> {
        sendMetricRequest(Endpoints.ARTIST_CONTROLLER_UNFOLLOW, "POST")
        val response = artistService.unfollowArtist(userId, artistId, accessToken)
        return ResponseEntity.ok(response)
    }
}