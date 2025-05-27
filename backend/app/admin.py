from django.contrib import admin
from .models import User, UserFollowedArtist, UserRecentlyAddedTrack

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
  list_display = ['id', 'name', 'email', 'playlist_id']
  search_fields = ['name', 'email', 'id']
  readonly_fields = ['id']

@admin.register(UserFollowedArtist)
class UserFollowedArtistAdmin(admin.ModelAdmin):
  list_display = ['user', 'artist_name', 'artist_id']
  list_filter = ['user']
  search_fields = ['artist_name', 'artist_id']

@admin.register(UserRecentlyAddedTrack)
class UserRecentlyAddedTrackAdmin(admin.ModelAdmin):
  list_display = ['user', 'track_name', 'track_added_at']
  list_filter = ['user', 'track_added_at']
  search_fields = ['track_name', 'track_id']
  ordering = ['-track_added_at']