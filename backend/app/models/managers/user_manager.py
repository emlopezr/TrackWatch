from django.db import models
from django.contrib.auth.models import BaseUserManager
from django.utils import timezone

class UserManager(BaseUserManager):
  def get_by_natural_key(self, email):
    return self.get(email=email)

  def create_superuser(self, email, name, password=None, **extra_fields):
    extra_fields.setdefault('is_staff', True)
    extra_fields.setdefault('is_superuser', True)
    extra_fields.setdefault('is_active', True)

    if extra_fields.get('is_staff') is not True:
      raise ValueError('Superuser must have is_staff=True.')
    if extra_fields.get('is_superuser') is not True:
      raise ValueError('Superuser must have is_superuser=True.')

    return self.create_user(email, name, password, **extra_fields)

  def create_user(self, email, name, password=None, **extra_fields):
    if not email: raise ValueError('The Email field must be set')
    email = self.normalize_email(email)
    user = self.model(email=email, name=name, **extra_fields)
    user.set_password(password)
    user.save(using=self._db)
    return user

  def create_from_spotify_dto(self, spotify_dto, access_token, refresh_token):
    return self.create(
      id=spotify_dto.get('id'),
      email=spotify_dto.get('email'),
      name=spotify_dto.get('name'),
      image_url=spotify_dto.get('image_url', ''),
      current_access_token=access_token,
      current_refresh_token=refresh_token,
      last_access_token=access_token,
      last_refresh_token=refresh_token,
      spotify_authorized_at=timezone.now(),
      setting_blocked_explicit_content=spotify_dto.get('blocked_explicit_content', False)
    )
