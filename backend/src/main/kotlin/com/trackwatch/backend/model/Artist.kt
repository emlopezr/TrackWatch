package com.trackwatch.backend.model

import jakarta.persistence.Column
import jakarta.persistence.Embeddable

@Embeddable
data class Artist(
    @Column(name = "artist_id")
    val id: String,

    @Column(name = "artist_name")
    val name: String,

    val imageUrl: String = ""
) {
    fun isEqualTo(other: Any): Boolean {
        if (other !is Artist) {  return false  }
        return this.id == other.id  && this.name == other.name
    }
}
