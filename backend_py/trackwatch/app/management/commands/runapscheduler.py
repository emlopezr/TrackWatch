import logging
from django.conf import settings
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from django.core.management.base import BaseCommand
from django_apscheduler.jobstores import DjangoJobStore
from django_apscheduler.models import DjangoJobExecution
from django_apscheduler import util
from app.services.search_followed_releases_use_case import update_new_releases_for_all_users

logger = logging.getLogger(__name__)

@util.close_old_connections
def run_core_task_scheduled():
  # Aquí llamas tu use case, directo:
  update_new_releases_for_all_users()
  logger.info("Ran update_new_releases_for_all_users")

@util.close_old_connections
def delete_old_job_executions(max_age=604_800):
  """ Limpia ejecuciones viejas de jobs (7 días por defecto) """
  DjangoJobExecution.objects.delete_old_job_executions(max_age)

class Command(BaseCommand):
  help = "Run APScheduler tasks as a blocking scheduler."

  def handle(self, *args, **options):
    scheduler = BlockingScheduler(timezone=settings.TIME_ZONE)
    scheduler.add_jobstore(DjangoJobStore(), "default")

    # 3 veces al día a las 7am, 2pm, 10pm
    scheduler.add_job(
      run_core_task_scheduled,
      trigger=CronTrigger(hour="7,14,21", minute=0),
      id="run_core_task_scheduled",
      max_instances=1,
      replace_existing=True,
    )
    logger.info("Added job 'run_core_task_scheduled'.")

    # Limpieza semanal de ejecuciones viejas
    scheduler.add_job(
      delete_old_job_executions,
      trigger=CronTrigger(
        day_of_week="mon", hour="00", minute="00"
      ),
      id="delete_old_job_executions",
      max_instances=1,
      replace_existing=True,
    )
    logger.info("Added weekly job: 'delete_old_job_executions'.")

    try:
      logger.info("Starting scheduler...")
      scheduler.start()
    except KeyboardInterrupt:
      logger.info("Stopping scheduler...")
      scheduler.shutdown()
      logger.info("Scheduler shut down successfully!")
