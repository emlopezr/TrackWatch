import { createContext } from 'react';

export interface RouterLocation {
  pathname: string;
  search: string;
  hash: string;
}

export interface NavigateOptions {
  replace?: boolean;
}

export interface RouterContextValue {
  location: RouterLocation;
  navigate: (to: string, options?: NavigateOptions) => void;
}

export const RouterContext = createContext<RouterContextValue | null>(null);
