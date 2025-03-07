package com.trackwatch.backend.controller

import com.trackwatch.backend.service.GeneratorService
import com.trackwatch.backend.utils.service.MetricService
import com.trackwatch.backend.utils.values.Endpoints
import com.trackwatch.backend.utils.values.Headers
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(Endpoints.GENERATOR_CONTROLLER_BASE)
class GeneratorController(
    private val generatorService: GeneratorService,
    metricService: MetricService
): BaseController(metricService) {

    @PostMapping(Endpoints.GENERATOR_CONTROLLER_ARTIST)
    fun generatePlaylist(
        @RequestParam userId: String,
        @RequestParam artistId: String,
        @RequestHeader(Headers.ACCESS_TOKEN) accessToken: String
    ): ResponseEntity<String> {
        sendMetricRequest(Endpoints.GENERATOR_CONTROLLER_ARTIST, "POST")
        generatorService.generateArtistPlaylist(userId, artistId, accessToken)
        return ResponseEntity.ok("Playlist generated")
    }

}