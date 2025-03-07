package com.trackwatch.backend.scheluded

import com.trackwatch.backend.use_case.SearchFollowedReleasesUseCase
import org.springframework.stereotype.Service
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.transaction.annotation.Transactional

@Service
class Scheduler(private val searchFollowedReleasesUseCase: SearchFollowedReleasesUseCase) {

    @Scheduled(cron = "0 0 3/8 * * *")
    @Transactional
    fun runCoreTaskScheduled() {
        searchFollowedReleasesUseCase.updateNewReleasesForAllUsers()
    }

}