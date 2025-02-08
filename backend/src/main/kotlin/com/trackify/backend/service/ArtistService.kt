package com.trackify.backend.service

import com.trackify.backend.exception.BadRequestException
import com.trackify.backend.exception.NotFoundException
import com.trackify.backend.model.core.Artist
import com.trackify.backend.repository.UserRepository
import com.trackify.backend.utils.values.ErrorCode
import org.springframework.stereotype.Service

@Service
class ArtistService(
    private val userRepository: UserRepository
) {

    fun followArtist(userId: String, artist: Artist, accessToken: String): MutableList<Artist> {
        val user = userRepository.findById(userId)
            .orElseThrow { NotFoundException(ErrorCode.USER_NOT_FOUND) }

        user.validateToken(accessToken)

        if (user.followedArtists.any { it.id == artist.id }) {
            throw BadRequestException(ErrorCode.USER_ALREADY_FOLLOWS_THIS_ARTIST)
        }

        user.followedArtists.add(artist)
        userRepository.save(user)
        return user.followedArtists
    }

    fun unfollowArtist(userId: String, artistId: String, accessToken: String): MutableList<Artist> {
        val user = userRepository.findById(userId)
            .orElseThrow { NotFoundException(ErrorCode.USER_NOT_FOUND) }

        user.validateToken(accessToken)

        val artist = user.followedArtists.find { it.id == artistId }
            ?: throw BadRequestException(ErrorCode.USER_DOES_NOT_FOLLOW_THIS_ARTIST)

        user.followedArtists.remove(artist)
        userRepository.save(user)
        return user.followedArtists
    }

}