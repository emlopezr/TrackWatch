package com.trackwatch.backend.model

import jakarta.persistence.Column
import jakarta.persistence.Embeddable
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
        if (other !is Track) { return false }
        return this.name == other.name && isEqualArtists(other)
    }

    fun isEqualStrict(other: Any): Boolean {
        if (other !is Track) { return false }
        return this.name == other.name
            && this.isExplicit == other.isExplicit
            && this.albumType == other.albumType
            && this.discNumber == other.discNumber
            && this.albumOrder == other.albumOrder
            && this.albumName == other.albumName
            && isEqualArtists(other)
    }

    private fun isEqualArtists(other: Track): Boolean {
        val orderedArtists = this.artists.sortedBy { it.name }
        val otherOrderedArtists = other.artists.sortedBy { it.name }

        return orderedArtists.size == otherOrderedArtists.size
            && orderedArtists.zip(otherOrderedArtists).all { (a, b) -> a.isEqualTo(b) }
    }

    fun toPersistedTrack(): PersistedTrack {
        return PersistedTrack(this)
    }
}

data class TrackImage(
    var url: String,
    var height: Int,
    var width: Int
)

@Embeddable
data class PersistedTrack (
    @Column(name = "track_id")
    val id: String,

    @Column(name = "track_name")
    val name: String,

    @Column(name = "track_added_at")
    val addedAt: Date = Date()
) {
    constructor(track: Track) : this(track.id, track.name)

    fun isEqualToTrack(other: Track): Boolean {
        return this.id == other.id
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is PersistedTrack) return false
        return id == other.id
    }

    override fun hashCode(): Int {
        var result = id.hashCode()
        result = 31 * result + name.hashCode()
        result = 31 * result + addedAt.hashCode()
        return result
    }
}