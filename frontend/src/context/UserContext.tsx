import { createContext } from 'react';
import { TrackifyUser } from '../types/trackify/TrackifyUser';

type UserContextType = {
  userData: TrackifyUser | null;
  setUserData: (user: TrackifyUser) => void;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);