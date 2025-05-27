from django.db import models
from .user import User
from django.utils import timezone

class UserRecentlyAddedTrack(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="recently_added_tracks")
  track_id = models.CharField(max_length=255)
  track_name = models.CharField(max_length=255)
  track_added_at = models.DateTimeField(default=timezone.now)

  class Meta:
    db_table = "users_recently_added_tracks"
    unique_together = ["user", "track_id"]
    ordering = ["-track_added_at"]

  def is_equal_to_track(self, track_data):
    if not isinstance(track_data, dict): return False
    return self.track_id == track_data.get("id")

  def __str__(self):
    return f"{self.track_name} (added by {self.user.name})"