package com.trackwatch.backend.scheluded

import org.springframework.stereotype.Service
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.transaction.annotation.Transactional

@Service
class Scheduler(private val scheduledService: ScheduledService) {

    @Scheduled(cron = "0 0 2,8,14,20 * * *")
    @Transactional
    fun runCoreTaskScheduled() {
        scheduledService.runCoreTask()
    }

}