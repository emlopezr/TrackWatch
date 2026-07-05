import { TRACKWATCH_API_BASE_URL } from "../common/constants";

const CSRF_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const SPOTIFY_REAUTH_REQUIRED_CODE = "SPOTIFY_REAUTH_REQUIRED";

let spotifyReauthRedirectInProgress = false;

export const apiUrl = (path: string): string =>
  `${TRACKWATCH_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const getCsrfToken = (): string => {
  const csrfCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="));

  return csrfCookie?.split("=")[1] ?? "";
};

const getSpotifyLoginUrl = (): string => {
  const redirectUri = `${window.location.origin}/callback`;
  return apiUrl(`/auth/spotify/login?redirect_uri=${encodeURIComponent(redirectUri)}`);
};

const redirectToSpotifyLoginIfNeeded = async (response: Response): Promise<void> => {
  if (response.status !== 401 || spotifyReauthRedirectInProgress) return;

  try {
    const error = await response.clone().json();
    if (error.code !== SPOTIFY_REAUTH_REQUIRED_CODE) return;
  } catch {
    return;
  }

  spotifyReauthRedirectInProgress = true;
  window.location.assign(getSpotifyLoginUrl());
};

export const apiFetch = async (path: string, init: RequestInit = {}): Promise<Response> => {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers ?? {});

  if (CSRF_METHODS.has(method) && !headers.has("X-CSRFToken")) {
    headers.set("X-CSRFToken", getCsrfToken());
  }

  const response = await fetch(apiUrl(path), {
    credentials: "include",
    ...init,
    headers,
  });

  await redirectToSpotifyLoginIfNeeded(response);
  return response;
};
