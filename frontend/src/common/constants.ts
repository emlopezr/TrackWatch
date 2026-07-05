type PublicRuntimeEnv = {
    VITE_HIDE_PUBLIC_LOGIN?: string;
};

const runtimeEnv = (window as typeof window & { __ENV__?: PublicRuntimeEnv }).__ENV__;

export const HIDE_PUBLIC_LOGIN = (runtimeEnv?.VITE_HIDE_PUBLIC_LOGIN ?? import.meta.env.VITE_HIDE_PUBLIC_LOGIN) === 'true';
export const TRACKWATCH_API_BASE_URL = "/api";
