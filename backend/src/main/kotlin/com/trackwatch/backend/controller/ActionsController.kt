package com.trackwatch.backend.controller

import com.trackwatch.backend.use_case.GenerateArtistPlaylistUseCase
import com.trackwatch.backend.use_case.SearchFollowedReleasesUseCase
import com.trackwatch.backend.service.MetricService
import com.trackwatch.backend.utils.values.Constants
import com.trackwatch.backend.utils.values.Endpoints
import com.trackwatch.backend.utils.values.Headers
import org.springframework.http.HttpMethod
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping(Endpoints.ACTIONS_CONTROLLER_BASE)
class ActionsController(
    private val generateArtistPlaylistUseCase: GenerateArtistPlaylistUseCase,
    private val searchFollowedReleasesUseCase: SearchFollowedReleasesUseCase,
    metricService: MetricService
): AbstractController(metricService) {

    @PostMapping(Endpoints.ACTIONS_GENERATE_ARTIST_PLAYLIST)
    fun generateArtistPlaylist(
        @RequestParam userId: String,
        @RequestParam artistId: String,
        @RequestParam(required = false) playlistId: String?,
        @RequestHeader(Headers.ACCESS_TOKEN) accessToken: String
    ): ResponseEntity<String> {
        sendMetricRequest(Endpoints.ACTIONS_GENERATE_ARTIST_PLAYLIST, HttpMethod.POST)

        generateArtistPlaylistUseCase.generateArtistPlaylist(userId, artistId, playlistId, accessToken)
        return ResponseEntity.ok("Playlist generated")
    }

    @PostMapping(Endpoints.ACTIONS_UPDATE_GET_NEW_RELEASES)
    fun updateNewReleases(
        @RequestHeader(Headers.ADMIN_KEY) adminKey: String,
        @RequestParam(required = false) daysLimit: Int?
    ): ResponseEntity<String> {
        sendMetricRequest(Endpoints.ACTIONS_UPDATE_GET_NEW_RELEASES, HttpMethod.POST)
        checkAdminKey(adminKey)

        searchFollowedReleasesUseCase.updateNewReleasesForAllUsers(daysLimit ?: Constants.FILTER_DAYS_LIMIT)
        return ResponseEntity.ok("New releases updated for all users")
    }

}