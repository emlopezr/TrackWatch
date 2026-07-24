import {
  type AnchorHTMLAttributes,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { RouterContext, type NavigateOptions, type RouterLocation } from './RouterContext';
import { useNavigate } from './useRouter';

interface RouterProviderProps {
  children: ReactNode;
}

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
}

const getLocation = (): RouterLocation => ({
  pathname: window.location.pathname,
  search: window.location.search,
  hash: window.location.hash,
});

export const RouterProvider = ({ children }: RouterProviderProps) => {
  const [location, setLocation] = useState(getLocation);

  useEffect(() => {
    const handlePopState = () => setLocation(getLocation());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string, options: NavigateOptions = {}) => {
    const destination = new URL(to, window.location.href);

    if (destination.origin !== window.location.origin) {
      window.location.assign(destination.href);
      return;
    }

    const destinationPath = `${destination.pathname}${destination.search}${destination.hash}`;
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (destinationPath === currentPath) {
      return;
    }

    if (options.replace) {
      window.history.replaceState(null, '', destinationPath);
    } else {
      window.history.pushState(null, '', destinationPath);
    }

    setLocation(getLocation());
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  const value = useMemo(() => ({ location, navigate }), [location, navigate]);

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
};

export const Link = ({
  to,
  onClick,
  target,
  children,
  ...anchorProps
}: LinkProps) => {
  const navigate = useNavigate();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);

    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
      || (target && target !== '_self')
    ) {
      return;
    }

    const destination = new URL(to, window.location.href);
    if (destination.origin !== window.location.origin) {
      return;
    }

    event.preventDefault();
    navigate(`${destination.pathname}${destination.search}${destination.hash}`);
  };

  return (
    <a
      {...anchorProps}
      href={to}
      target={target}
      onClick={handleClick}
    >
      {children}
    </a>
  );
};
