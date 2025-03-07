import { createContext } from 'react';
import { TrackWatchUser } from '../types/trackwatch/TrackWatchUser';

type UserContextType = {
  userData: TrackWatchUser | null;
  setUserData: (user: TrackWatchUser | null) => void;
};

export const UserContext = createContext<UserContextType | undefined>(undefined);