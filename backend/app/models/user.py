from django.db import models
from .managers.user_manager import UserManager
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.utils import timezone
from app.exceptions.exceptions import UnauthorizedException
from app.exceptions.exceptions import ErrorCode

class User(AbstractBaseUser, PermissionsMixin):
  id = models.CharField(max_length=255, primary_key=True)
  playlist_id = models.CharField(max_length=255, blank=True)
  email = models.EmailField(unique=True)
  name = models.CharField(max_length=255)
  image_url = models.URLField(blank=True)

  current_access_token = models.TextField(blank=True)
  current_refresh_token = models.TextField(blank=True)
  last_access_token = models.TextField(blank=True)
  last_refresh_token = models.TextField(blank=True)

  setting_blocked_explicit_content = models.BooleanField(default=False)
  # Indicates whether TrackWatch should keep adding new releases automatically to the user's playlist
  updates_enabled = models.BooleanField(default=True)

  is_active = models.BooleanField(default=True)
  is_staff = models.BooleanField(default=False)
  date_joined = models.DateTimeField(default=timezone.now)

  objects = UserManager()
  USERNAME_FIELD = 'email'
  REQUIRED_FIELDS = ['id', 'name']

  class Meta: db_table = "users"

  def save_user(self):
    self.save()
    return self

  def validate_token(self, access_token):
    if self.current_access_token != access_token and self.last_access_token != access_token:
      raise UnauthorizedException(ErrorCode.USER_INVALID_CREDENTIALS)

  def update_tokens(self, access_token, refresh_token):
    self.last_access_token = self.current_access_token
    self.last_refresh_token = self.current_refresh_token
    self.current_access_token = access_token
    self.current_refresh_token = refresh_token
    self.save()

  def clear_spotify_tokens(self):
    self.last_access_token = ""
    self.last_refresh_token = ""
    self.current_access_token = ""
    self.current_refresh_token = ""
    self.save(update_fields=[
      "last_access_token",
      "last_refresh_token",
      "current_access_token",
      "current_refresh_token",
    ])

  def get_full_name(self): return self.name
  def get_short_name(self): return self.name
  def __str__(self): return self.email
