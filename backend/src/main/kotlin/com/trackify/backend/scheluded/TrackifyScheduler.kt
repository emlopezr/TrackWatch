package com.trackify.backend.scheluded

import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service

@Service
class TrackifyScheduler(
    private val scheduledService: ScheduledService,
) {

    private val logger = LoggerFactory.getLogger(TrackifyScheduler::class.java)

    @Scheduled(cron = "0 0 0 * * *")
    fun checkNewSongs() {
        scheduledService.runCoreTask()
    }
}