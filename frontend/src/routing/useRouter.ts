import { useContext } from 'react';
import { RouterContext } from './RouterContext';

const useRouter = () => {
  const context = useContext(RouterContext);

  if (!context) {
    throw new Error('Router hooks must be used within RouterProvider');
  }

  return context;
};

export const useLocation = () => useRouter().location;

export const useNavigate = () => useRouter().navigate;
