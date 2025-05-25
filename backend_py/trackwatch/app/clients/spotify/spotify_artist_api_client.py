from .spotify_api_client import spotify_api_request
from app.exceptions import InternalServerErrorException, ErrorCode
from app.classes import Artist, Track, TrackImage
import datetime

def get_artist_info(artist_id, access_token):
  try:
    response = spotify_api_request(
      method="GET",
      endpoint=f"/artists/{artist_id}",
      token=access_token
    )
    return parse_artist_info(response)
  except Exception as e:
    raise InternalServerErrorException(
      ErrorCode.UNHANDLED_EXCEPTION,
      f"Error while calling Spotify API: {str(e)}"
    )

def search_artist_tracks_with_retries(artist, access_token, days_limit, page, max_attempts=3):
  last_exception = None
  for attempt in range(1, max_attempts + 1):
    try:
      return search_artist_tracks(artist, access_token, days_limit, page)
    except Exception as e:
      last_exception = e
      print(f"Spotify API call failed (attempt {attempt}/{max_attempts}): {e}")
      if attempt < max_attempts:
        wait_time = 1 * attempt
        print(f"Retrying in {wait_time}s")
        import time; time.sleep(wait_time)
  raise InternalServerErrorException(
    ErrorCode.UNHANDLED_EXCEPTION,
    f"Error while calling Spotify API after {max_attempts} attempts: {str(last_exception)}"
  )

def search_artist_tracks(artist, access_token, days_limit, page):
  query_params = build_query_params(artist.name, days_limit, page)
  try:
    response = spotify_api_request(
      method="GET",
      endpoint=f"/search?{query_params}",
      token=access_token
    )
    return parse_tracks(response)
  except Exception as e:
    raise InternalServerErrorException(
      ErrorCode.UNHANDLED_EXCEPTION,
      f"Error while calling Spotify API: {str(e)}"
    )

def parse_tracks(response):
  tracks_map = response.get("tracks", {})
  items = tracks_map.get("items", [])
  parsed_tracks = []
  for map_track in items:
    artists_json = map_track.get("artists", [])
    album_json = map_track.get("album", {})
    release_date_string = album_json.get("release_date")
    release_date_precision = album_json.get("release_date_precision")
    release_date = format_release_date(release_date_string, release_date_precision)

    track = Track(
      id = map_track.get("id"),
      uri = map_track.get("uri"),
      name = map_track.get("name"),
      artists = parse_artists(artists_json),
      release_date = release_date,
      is_explicit = map_track.get("explicit"),
      album_name = album_json.get("name"),
      album_images = parse_album_images(album_json),
      album_type = album_json.get("album_type"),
      disc_number = map_track.get("disc_number"),
      album_order = map_track.get("track_number"),
      duration_ms = map_track.get("duration_ms")
    )
    parsed_tracks.append(track)
  return parsed_tracks

def format_release_date(release_date_string, release_date_precision):
  if not release_date_string or not release_date_precision:
    raise InternalServerErrorException(
      ErrorCode.UNHANDLED_EXCEPTION,
      "Invalid release date or precision"
    )
  try:
    if release_date_precision == "year":
      return datetime.datetime.strptime(f"{release_date_string[:4]}-01-01", "%Y-%m-%d")
    elif release_date_precision == "month":
      return datetime.datetime.strptime(f"{release_date_string[:7]}-01", "%Y-%m-%d")
    elif release_date_precision == "day":
      return datetime.datetime.strptime(release_date_string, "%Y-%m-%d")
    else:
      raise InternalServerErrorException(
        ErrorCode.UNHANDLED_EXCEPTION,
        f"Invalid release date precision: {release_date_precision}"
      )
  except Exception as e:
    raise InternalServerErrorException(
      ErrorCode.UNHANDLED_EXCEPTION,
      f"Invalid date parsing: {release_date_string}, {release_date_precision} -- {e}"
    )

def parse_artists(data_artists):
  parsed = []
  for map_artist in data_artists:
    artist = Artist(
      id = map_artist.get("id"),
      name = map_artist.get("name")
    )
    parsed.append(artist)
  return parsed

def parse_album_images(data_album):
  parsed = []
  images = data_album.get("images", [])
  for map_image in images:
    image = TrackImage(
      url = map_image.get("url"),
      width = map_image.get("width"),
      height = map_image.get("height")
    )
    parsed.append(image)
  return parsed

def build_query_params(artist_name, days_limit, page):
  from urllib.parse import quote_plus
  q = build_query(artist_name, days_limit)
  q_escaped = quote_plus(q)
  type_ = "track"
  limit = 50
  offset = page * 50
  return f"q={q_escaped}&type={type_}&limit={limit}&offset={offset}"

def build_query(artist_name, days_limit):
  if days_limit is None:
    return f"artist:{artist_name}"
  today = datetime.datetime.now(datetime.timezone.utc)
  start_date = today - datetime.timedelta(days=days_limit)
  start_year = start_date.strftime("%Y")
  today_year = today.strftime("%Y")
  search_query = f"artist:{artist_name}"
  if start_year == today_year:
    search_query += f" year:{start_year}"
  else:
    search_query += f" year:{start_year}-{today_year}"
  return search_query

def parse_artist_info(response):
  images = response.get("images", [])
  image_url = images[0]["url"] if images else ""
  return Artist(
    id = response.get("id"),
    name = response.get("name"),
    image_url = image_url
  )
