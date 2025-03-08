package com.trackwatch.backend.controller

import com.trackwatch.backend.use_case.GenerateArtistPlaylistUseCase
import com.trackwatch.backend.service.MetricService
import com.trackwatch.backend.utils.values.Endpoints
import com.trackwatch.backend.utils.values.Headers
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(Endpoints.GENERATOR_CONTROLLER_BASE)
class GeneratorController(
    private val generateArtistPlaylistUseCase: GenerateArtistPlaylistUseCase,
    metricService: MetricService
): BaseController(metricService) {

    @PostMapping(Endpoints.GENERATOR_CONTROLLER_ARTIST)
    fun generatePlaylist(
        @RequestParam userId: String,
        @RequestParam artistId: String,
        @RequestParam(required = false) playlistId: String?,
        @RequestHeader(Headers.ACCESS_TOKEN) accessToken: String
    ): ResponseEntity<String> {
        sendMetricRequest(Endpoints.GENERATOR_CONTROLLER_ARTIST, "POST")
        generateArtistPlaylistUseCase.generateArtistPlaylist(userId, artistId, playlistId, accessToken)
        return ResponseEntity.ok("Playlist generated")
    }

}