import requests

SPOTIFY_API_BASE_URL = "https://api.spotify.com/v1"
SPOTIFY_AUTH_BASE_URL = "https://accounts.spotify.com/api"

def get_spotify_api_session():
  session = requests.Session()
  session.headers.update({"Content-Type": "application/json"})
  # Aquí podrías configurar tamaño de respuesta máxima si fuera necesario, requests lo maneja internamente bien
  return session

def get_spotify_auth_session():
  session = requests.Session()
  session.headers.update({"Content-Type": "application/x-www-form-urlencoded"})
  return session

def spotify_api_request(method, endpoint, token=None, params=None, data=None, json_data=None, headers=None):
  url = f"{SPOTIFY_API_BASE_URL}{endpoint}"
  request_headers = headers or {}

  if token: request_headers["Authorization"] = f"Bearer {token}"

  response = requests.request(
    method,
    url,
    params=params,
    data=data,
    json=json_data,
    headers=request_headers
  )

  response.raise_for_status()
  return response.json()

def spotify_auth_request(method, endpoint, params=None, data=None, auth=None):
  url = f"{SPOTIFY_AUTH_BASE_URL}{endpoint}"

  response = requests.request(
    method,
    url,
    params=params,
    data=data,
    auth=auth
  )

  response.raise_for_status()
  return response.json()
