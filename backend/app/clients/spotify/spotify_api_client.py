import requests
import time

SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1"
SPOTIFY_AUTH_BASE_URL = "https://accounts.spotify.com/api"

MAX_RETRIES = 3
BASE_BACKOFF_SECONDS = 1

def get_spotify_api_session():
  session = requests.Session()
  session.headers.update({"Content-Type": "application/json"})
  return session

def get_spotify_auth_session():
  session = requests.Session()
  session.headers.update({"Content-Type": "application/x-www-form-urlencoded"})
  return session

def spotify_api_request(method, endpoint, token=None, params=None, data=None, json_data=None, headers=None):
  url = f"{SPOTIFY_API_BASE_URL}{endpoint}"
  request_headers = headers or {}

  if token: request_headers["Authorization"] = f"Bearer {token}"

  for attempt in range(MAX_RETRIES + 1):
    response = requests.request(
      method,
      url,
      params=params,
      data=data,
      json=json_data,
      headers=request_headers,
      timeout=(10, 60)
    )

    if response.status_code == 429:
      if attempt < MAX_RETRIES:
        retry_after = int(response.headers.get('Retry-After', BASE_BACKOFF_SECONDS))
        wait_time = retry_after * (2 ** attempt)
        time.sleep(wait_time)
        continue
      else:
        response.raise_for_status()

    response.raise_for_status()
    if response.status_code == 204:
      return None
    return response.json()

  return None

def spotify_auth_request(method, endpoint, params=None, data=None, auth=None):
  url = f"{SPOTIFY_AUTH_BASE_URL}{endpoint}"

  response = requests.request(
    method,
    url,
    params=params,
    data=data,
    auth=auth,
    timeout=(10, 30)
  )

  response.raise_for_status()
  return response.json()
