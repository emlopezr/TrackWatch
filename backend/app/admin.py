from django.contrib import admin
from .models import User, UserRecentlyAddedTrack

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
  list_display = ['id', 'name', 'email', 'playlist_id']
  search_fields = ['name', 'email', 'id']
  readonly_fields = ['id']
  exclude = [
    'password',
    'current_access_token',
    'current_refresh_token',
    'last_access_token',
    'last_refresh_token',
  ]

@admin.register(UserRecentlyAddedTrack)
class UserRecentlyAddedTrackAdmin(admin.ModelAdmin):
  list_display = ['user', 'track_name', 'track_added_at']
  list_filter = ['user', 'track_added_at']
  search_fields = ['track_name', 'track_id']
  ordering = ['-track_added_at']
