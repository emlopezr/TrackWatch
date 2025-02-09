package com.trackify.backend

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
@EnableAsync
@EntityScan("com.trackify.backend.model")
class BackendApplication

fun main(args: Array<String>) {
	runApplication<BackendApplication>(*args)
}
