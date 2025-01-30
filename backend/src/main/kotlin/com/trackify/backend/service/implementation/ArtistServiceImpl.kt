package com.trackify.backend.service.implementation

import com.trackify.backend.exception.BadRequestException
import com.trackify.backend.exception.NotFoundException
import com.trackify.backend.model.core.Artist
import com.trackify.backend.repository.UserRepository
import com.trackify.backend.service.contract.ArtistService
import com.trackify.backend.utils.ErrorCode
import org.springframework.stereotype.Service

@Service
class ArtistServiceImpl(
    private val userRepository: UserRepository
): ArtistService {

    override fun followArtist(userId: String, artist: Artist, accessToken: String): MutableList<Artist> {
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

    override fun unfollowArtist(userId: String, artistId: String, accessToken: String): MutableList<Artist> {
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