// Environment variables
export const SPOTIFY_CLIENT_ID  = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
export const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
export const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

// Trackify Backend
export const TRACKIFY_API_BASE_URL = import.meta.env.VITE_TRACKIFY_API_BASE_URL;

// Spotify API
export const SPOTIFY_BASE_URL = 'https://accounts.spotify.com';
export const SPOTIFY_API_URL = 'https://api.spotify.com/v1';
export const SPOTIFY_SCOPES = [
  'user-read-private',
  'playlist-read-private',
  'playlist-modify-private',
  'playlist-modify-public',
  'user-read-email',
  'user-library-read'
]
