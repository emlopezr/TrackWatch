export const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
export const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
export const SPOTIFY_REDIRECT_URI =
    import.meta.env.VITE_SPOTIFY_REDIRECT_URI ||
    `${window.location.origin}/callback`;

export const TRACKWATCH_API_BASE_URL = (() => {
    const url = import.meta.env.VITE_TRACKWATCH_API_BASE_URL;
    if (!url) return "";
    if (url.startsWith("http") || url.startsWith("/")) return url;
    return `https://${url}`;
})();

export const SPOTIFY_BASE_URL = "https://accounts.spotify.com";
export const SPOTIFY_API_URL = "https://api.spotify.com/v1";
export const SPOTIFY_SCOPES = [
    "user-read-private",
    "playlist-read-private",
    "playlist-modify-private",
    "playlist-modify-public",
    "user-read-email",
    "user-library-read",
    "ugc-image-upload",
    "user-follow-read",
    "user-follow-modify",
];
