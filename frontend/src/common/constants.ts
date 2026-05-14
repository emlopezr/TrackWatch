// Runtime env injection (Docker pre-built images) takes priority over build-time Vite env
const env = (key: string): string | undefined =>
    ((window as unknown as Record<string, Record<string, string>>).__ENV__?.[key]) ?? import.meta.env[key];

export const HIDE_PUBLIC_LOGIN = env('VITE_HIDE_PUBLIC_LOGIN') === 'true';
export const TRACKWATCH_API_BASE_URL = "/api";
