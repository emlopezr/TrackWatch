package com.trackify.backend.controller.contract

import org.springframework.http.ResponseEntity

interface UtilsController {
    fun ping(): ResponseEntity<String>
    fun run(adminKey: String): ResponseEntity<String>
}