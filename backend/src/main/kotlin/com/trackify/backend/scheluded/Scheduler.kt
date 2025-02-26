package com.trackify.backend.scheluded

import com.trackify.backend.controller.UtilsController
import com.trackify.backend.utils.values.Constants
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service

@Service
class Scheduler(private val utilsController: UtilsController) {

    @Scheduled(cron = "0 0 */4 * * *")
    fun runCoreTaskScheduled() {
        utilsController.run(
            System.getenv("ADMIN_KEY"),
            Constants.DAYS_LIMIT
        )
    }

}