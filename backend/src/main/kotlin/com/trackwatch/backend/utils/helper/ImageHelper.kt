package com.trackwatch.backend.utils.helper

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient

@Component
class ImageHelper() {

    private val webClient = WebClient.builder().build()
    private val log = LoggerFactory.getLogger(ImageHelper::class.java)

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