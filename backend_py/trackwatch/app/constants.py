class Headers:
  AUTHORIZATION = "Authorization"
  CONTENT_TYPE = "Content-Type"
  ADMIN_KEY = "X-Admin-Key"
  SPOTIFY_ACCESS_TOKEN = "X-Spotify-Access-Token"
  SPOTIFY_REFRESH_TOKEN = "X-Spotify-Refresh-Token"

class Endpoints:
  PING = "ping"
  GENERATE_PLAYLIST = "actions/generate"
  UPDATE_RELEASES = "actions/releases"
  FOLLOW_ARTIST = "artists/follow"
  UNFOLLOW_ARTIST = "artists/unfollow"
  REGISTER_USER = "users/register"
  GET_CURRENT_USER = "users/me"


class AppInfo:
  APP_NAME = "TrackWatch"
  DOMAIN = "emlopezr.com"
  DEVELOPER = "emlopezr"
  GITHUB_USER_PROFILE = f"https://github.com/{DEVELOPER}"


class Domains:
  PRODUCTION_DOMAIN = "https://trackwatch.emlopezr.com"
  DEVELOPMENT_DOMAIN = "http://localhost:5173"

class Database:
  USER_TABLE = "users"
  USER_FOLLOWED_ARTIST_TABLE = "users_followed_artists"
  USER_RECENTLY_ADDED_TRACKS_TABLE = "users_recently_added_tracks"

class System:
  SERVER_TIMEZONE = "America/Bogota"
  PAGES_TO_FETCH = 4
  FILTER_DAYS_LIMIT = 2
  CLEANUP_DAYS_LIMIT = 15
  MAX_LOOP_ITERATION = 19
  DEFAULT_WAIT_TIME_SECONDS = 3

class Playlist:
  DEFAULT_PRIVACY = True
  DEFAULT_NAME = f"Your {AppInfo.APP_NAME} Playlist"
  DEFAULT_DESCRIPTION = f"Your latest releases from your favorite artists - Powered by {AppInfo.APP_NAME}"

class Colors:
  LIGHT_GRAY_1 = "#F7F7F7"
  LIGHT_GRAY_2 = "#F4F4F4"
  LIGHT_GRAY_3 = "#DDDDDD"
  DARK_GRAY = "#333333"
  WHITE = "#FFFFFF"
  GREEN = "#49B243"

class Assets:
  BASE_PATH = f"https://raw.githubusercontent.com/{AppInfo.DEVELOPER}/{AppInfo.APP_NAME}/refs/heads/develop/assets/"
  DEFAULT_PLAYLIST_COVER_URL = f"{BASE_PATH}default_playlist_cover.png"
  DEFAULT_TRACK_IMAGE_URL = f"{BASE_PATH}track_placeholder.png"
