package com.trackwatch.backend.repository

import com.trackwatch.backend.model.User
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<User, String>