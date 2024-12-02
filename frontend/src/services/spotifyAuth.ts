import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, SPOTIFY_SCOPES, SPOTIFY_BASE_URL } from '../common/constants';

const generateState = (length: number): string => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  localStorage.setItem('spotify_auth_state', text);
  return text;
}

export const getSpotifyAuthUrl = (): string => {
  const scope = SPOTIFY_SCOPES.join(' ');

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state: generateState(16),
    scope,
  });

  const authUrl = `${SPOTIFY_BASE_URL}/authorize?${params.toString()}`;

  return authUrl;
};