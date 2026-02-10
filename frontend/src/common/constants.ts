// Runtime env injection (Docker pre-built images) takes priority over build-time Vite env
const env = (key: string): string | undefined =>
    ((window as unknown as Record<string, Record<string, string>>).__ENV__?.[key]) ?? import.meta.env[key];

export const SPOTIFY_CLIENT_ID = env('VITE_SPOTIFY_CLIENT_ID') ?? '';
export const SPOTIFY_CLIENT_SECRET = env('VITE_SPOTIFY_CLIENT_SECRET') ?? '';
export const SPOTIFY_REDIRECT_URI =
    env('VITE_SPOTIFY_REDIRECT_URI') ||
    `${window.location.origin}/callback`;

export const HIDE_PUBLIC_LOGIN = env('VITE_HIDE_PUBLIC_LOGIN') === 'true';

export const TRACKWATCH_API_BASE_URL = (() => {
    const url = env('VITE_TRACKWATCH_API_BASE_URL');
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
