package com.trackify.backend.scheluded

import org.springframework.stereotype.Service
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.transaction.annotation.Transactional

@Service
class Scheduler(private val scheduledService: ScheduledService) {

    @Scheduled(cron = "0 0 */1 * * *")
    @Transactional
    fun runCoreTaskScheduled() {
        scheduledService.runCoreTask()
    }

}