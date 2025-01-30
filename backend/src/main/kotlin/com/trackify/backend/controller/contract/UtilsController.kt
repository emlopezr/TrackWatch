package com.trackify.backend.controller.contract

import com.trackify.backend.model.core.Artist
import org.springframework.http.ResponseEntity

interface UtilsController {
    fun ping(): String
}