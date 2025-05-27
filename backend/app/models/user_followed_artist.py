from django.db import models
from .user import User

class UserFollowedArtist(models.Model):
  user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followed_artists")
  artist_id = models.CharField(max_length=255)
  artist_name = models.CharField(max_length=255)
  image_url = models.URLField(blank=True, default="")

  class Meta:
    db_table = "users_followed_artists"
    unique_together = ["user", "artist_id"]

  def is_equal_to(self, other_artist_data):
    if not isinstance(other_artist_data, dict): return False
    return (
      self.artist_id == other_artist_data.get("id") and
      self.artist_name == other_artist_data.get("name")
    )

  def __str__(self):
    return f"{self.artist_name} (followed by {self.user.name})"
