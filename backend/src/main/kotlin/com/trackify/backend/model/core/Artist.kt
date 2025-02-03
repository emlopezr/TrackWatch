package com.trackify.backend.model.core

data class Artist(
    val id: String,
    val name: String
) {
    fun isEqualTo(other: Any): Boolean {
        if (other !is Artist) {
            return false
        }

        return this.id == other.id
                && this.name == other.name
    }
}
