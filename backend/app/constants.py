from decouple import config

class Headers:
  AUTHORIZATION = "Authorization"
  CONTENT_TYPE = "Content-Type"
  ADMIN_KEY = "X-Admin-Key"
  SPOTIFY_ACCESS_TOKEN = "X-Spotify-Access-Token"
  SPOTIFY_REFRESH_TOKEN = "X-Spotify-Refresh-Token"

class Endpoints:
  PING = "ping"
  SPOTIFY_LOGIN = "auth/spotify/login"
  SPOTIFY_EXCHANGE = "auth/spotify/exchange"
  LOGOUT = "auth/logout"
  SPOTIFY_ME = "spotify/me"
  SPOTIFY_SEARCH = "spotify/search"
  SPOTIFY_ARTIST_DETAIL = "spotify/artists/<artist_id>"
  SPOTIFY_FOLLOWING = "spotify/me/following"
  GENERATE_PLAYLIST = "actions/generate"
  UPDATE_RELEASES = "actions/releases"
  FOLLOW_ARTIST = "artists/follow"
  UNFOLLOW_ARTIST = "artists/unfollow"
  REGISTER_USER = "users/register"
  GET_CURRENT_USER = "users/me"
  EULA = "eula"
  PRIVACY = "privacy"
  TOGGLE_PLAYLIST_UPDATES = "users/<id>/playlist-updates"

  GHOST_TRACKS_PLAYLISTS = "ghost-tracks/playlists"
  GHOST_TRACKS_SCAN = "ghost-tracks/scan"
  GHOST_TRACKS_REMOVE = "ghost-tracks/remove"

class AppInfo:
  APP_NAME = "TrackWatch"
  DOMAIN = config("EMAIL_DOMAIN", default="emlopezr.com")
  DEVELOPER = "emlopezr"
  GITHUB_USER_PROFILE = f"https://github.com/{DEVELOPER}"

class Domains:
  PRODUCTION_DOMAIN = "https://trackwatch.emlopezr.com"
  DEVELOPMENT_DOMAIN = "http://localhost:5173"

class Spotify:
  AUTH_BASE_URL = "https://accounts.spotify.com"
  SESSION_USER_KEY = "trackwatch_user_id"
  OAUTH_STATE_KEY = "spotify_oauth_state"
  SCOPES = [
    "user-read-private",
    "playlist-read-private",
    "playlist-modify-private",
    "playlist-modify-public",
    "user-read-email",
    "user-library-read",
    "ugc-image-upload",
    "user-follow-read",
    "user-follow-modify",
  ]

class Database:
  USER_TABLE = "users"
  USER_RECENTLY_ADDED_TRACKS_TABLE = "users_recently_added_tracks"

class System:
  SERVER_TIMEZONE = "America/Bogota"
  PAGES_TO_FETCH = 15  # limit=10 × 15 pages = 150 results (equivalent to previous limit=50 × 3 pages)
  FILTER_DAYS_LIMIT = 2
  CLEANUP_DAYS_LIMIT = 30
  MAX_LOOP_ITERATION = 99  # limit=10 × 100 iterations = 1000 results (equivalent to previous limit=50 × 20)
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
