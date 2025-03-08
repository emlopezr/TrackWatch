package com.trackwatch.backend.model

import java.util.Date

data class Track (
    val id: String,
    val uri: String,
    val name: String,
    val artists: List<Artist>,
    val releaseDate: Date,
    val isExplicit: Boolean,

    val albumName: String,
    val albumImages: List<TrackImage>,
    val albumType: String,
    val discNumber: Int,
    val albumOrder: Int,

    val durationMs: Int,
) {
    fun isEqualTo(other: Any): Boolean {
        if (other !is Track) {
            return false
        }

        // Check if the artists are the same - Order artist list before comparing
        val orderedArtists = this.artists.sortedBy { it.name }
        val otherOrderedArtists = other.artists.sortedBy { it.name }

        val equalArtists = orderedArtists.size == otherOrderedArtists.size
            && orderedArtists.zip(otherOrderedArtists).all { (a, b) -> a.isEqualTo(b) }

        return this.name == other.name && equalArtists
    }

    fun isExactlyEqual(other: Any): Boolean {
        if (other !is Track) {
            return false
        }

        // Check if the artists are the same - Order artist list before comparing
        val orderedArtists = this.artists.sortedBy { it.name }
        val otherOrderedArtists = other.artists.sortedBy { it.name }

        val equalArtists = orderedArtists.size == otherOrderedArtists.size
            && orderedArtists.zip(otherOrderedArtists).all { (a, b) -> a.isEqualTo(b) }

        return this.name == other.name
            && this.isExplicit == other.isExplicit
            && this.albumType == other.albumType
            && this.discNumber == other.discNumber
            && this.albumOrder == other.albumOrder
            && this.albumName == other.albumName
            && equalArtists
    }
}

data class TrackImage(
    var url: String,
    var height: Int,
    var width: Int
)