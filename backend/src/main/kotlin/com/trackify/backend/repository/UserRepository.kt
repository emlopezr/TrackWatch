package com.trackify.backend.repository

import com.trackify.backend.model.core.User
import org.springframework.data.mongodb.repository.MongoRepository

interface UserRepository : MongoRepository<User, String> {
    fun findByAuthCurrentAccessToken(accessToken: String): User?
    fun findByAuthLastAccessToken(accessToken: String): User?
}
