"""
APScheduler Management Command for TrackWatch

This command runs the background task scheduler as a standalone blocking process.
It should be run in a separate container/process from the web server.

Usage:
    python manage.py run_scheduler

Environment Variables:
    SCHEDULER_HOURS: Comma-separated hours to run (default: "7,14,21")
    SCHEDULER_MINUTE: Minute of the hour to run (default: 0)
    TZ / TIME_ZONE: Timezone for scheduling (default: from Django settings)
"""

import logging
import signal
import sys
from decouple import config
from django.conf import settings
from django.core.management.base import BaseCommand
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from django_apscheduler.jobstores import DjangoJobStore
from django_apscheduler.models import DjangoJobExecution
from django_apscheduler import util

from app.services.search_followed_releases_use_case import update_new_releases_for_all_users

logger = logging.getLogger(__name__)


@util.close_old_connections
def run_release_update_task():
    """
    Main scheduled task: Update new releases for all users.
    
    This is the same function called by the /actions/releases endpoint,
    allowing both scheduled and manual/webhook triggers.
    """
    logger.info("Starting scheduled release update task...")
    try:
        result = update_new_releases_for_all_users()
        logger.info(
            f"Release update completed: status={result['status']}, "
            f"ok={result['ok_users_count']}, errors={result['error_users_count']}"
        )
    except Exception as e:
        logger.error(f"Release update task failed: {e}", exc_info=True)


@util.close_old_connections
def cleanup_old_job_executions(max_age: int = 604_800):
    """
    Clean up old job execution records from the database.
    
    Args:
        max_age: Maximum age in seconds (default: 7 days = 604800 seconds)
    """
    logger.info("Cleaning up old job execution records...")
    DjangoJobExecution.objects.delete_old_job_executions(max_age)
    logger.info("Cleanup completed.")


class Command(BaseCommand):
    help = "Run the APScheduler background task scheduler (blocking mode)."

    def add_arguments(self, parser):
        parser.add_argument(
            '--hours',
            type=str,
            default=config('SCHEDULER_HOURS', default='7,14,21'),
            help='Comma-separated hours to run the release update (default: 7,14,21)'
        )
        parser.add_argument(
            '--minute',
            type=int,
            default=config('SCHEDULER_MINUTE', default=0, cast=int),
            help='Minute of the hour to run (default: 0)'
        )
        parser.add_argument(
            '--run-now',
            action='store_true',
            help='Run the release update task immediately on startup'
        )

    def handle(self, *args, **options):
        scheduler = BlockingScheduler(timezone=settings.TIME_ZONE)
        scheduler.add_jobstore(DjangoJobStore(), "default")

        hours = options['hours']
        minute = options['minute']

        # Register signal handlers for graceful shutdown
        def shutdown_handler(signum, frame):
            logger.info(f"Received signal {signum}, shutting down scheduler...")
            scheduler.shutdown(wait=False)
            sys.exit(0)

        signal.signal(signal.SIGTERM, shutdown_handler)
        signal.signal(signal.SIGINT, shutdown_handler)

        # Main task: Check for new releases
        scheduler.add_job(
            run_release_update_task,
            trigger=CronTrigger(hour=hours, minute=minute),
            id="release_update_task",
            max_instances=1,
            replace_existing=True,
        )
        logger.info(f"Scheduled release update task at hours={hours}, minute={minute}")

        # Maintenance task: Clean up old job records weekly
        scheduler.add_job(
            cleanup_old_job_executions,
            trigger=CronTrigger(day_of_week="sun", hour="3", minute="0"),
            id="cleanup_old_executions",
            max_instances=1,
            replace_existing=True,
        )
        logger.info("Scheduled weekly cleanup task (Sundays at 03:00)")

        # Optionally run immediately on startup
        if options['run_now']:
            logger.info("Running release update task immediately (--run-now flag)")
            run_release_update_task()

        self.stdout.write(self.style.SUCCESS(
            f"Scheduler started. Release updates scheduled at {hours}:{minute:02d} "
            f"(timezone: {settings.TIME_ZONE})"
        ))
        self.stdout.write(self.style.NOTICE(
            "Press Ctrl+C to stop. For webhook/manual triggers, use POST /actions/releases"
        ))

        try:
            scheduler.start()
        except (KeyboardInterrupt, SystemExit):
            logger.info("Scheduler stopped.")
            self.stdout.write(self.style.SUCCESS("Scheduler shut down successfully."))
