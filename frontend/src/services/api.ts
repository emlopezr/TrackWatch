import { TRACKWATCH_API_BASE_URL } from "../common/constants";

const CSRF_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const apiUrl = (path: string): string =>
  `${TRACKWATCH_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const getCsrfToken = (): string => {
  const csrfCookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="));

  return csrfCookie?.split("=")[1] ?? "";
};

export const apiFetch = (path: string, init: RequestInit = {}): Promise<Response> => {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers ?? {});

  if (CSRF_METHODS.has(method) && !headers.has("X-CSRFToken")) {
    headers.set("X-CSRFToken", getCsrfToken());
  }

  return fetch(apiUrl(path), {
    credentials: "include",
    ...init,
    headers,
  });
};
