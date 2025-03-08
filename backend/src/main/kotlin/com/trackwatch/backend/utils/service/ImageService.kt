package com.trackwatch.backend.utils.service

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient

@Service
class ImageService {

    private val webClient: WebClient = WebClient.builder().build()
    private val log = LoggerFactory.getLogger(ImageService::class.java)

    fun encodeImageToBase64(imageUrl: String): String? {
        return try {
            val bytes = webClient.get()
                .uri(imageUrl)
                .retrieve()
                .bodyToMono(ByteArray::class.java)
                .block()
            bytes?.let { java.util.Base64.getEncoder().encodeToString(it) }
        } catch (e: Exception) {
            log.error("Error while encoding image to base64", e)
            null
        }
    }

}