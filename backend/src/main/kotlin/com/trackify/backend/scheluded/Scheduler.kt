package com.trackify.backend.scheluded

import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service

@Service
class Scheduler(private val scheduledService: ScheduledService) {

    @Scheduled(cron = "0 0 */4 * * *")
    fun runCoreTaskScheduled() {
        scheduledService.runCoreTask()
    }

}