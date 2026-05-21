export const getSpotifyAuthUrl = (): string => {
    const redirectUri = `${window.location.origin}/callback`;
    return `/api/auth/spotify/login?redirect_uri=${encodeURIComponent(redirectUri)}`;
};
