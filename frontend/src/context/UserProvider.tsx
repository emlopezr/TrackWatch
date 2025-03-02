import { useState, ReactNode } from 'react';
import { TrackWatchUser } from '../types/trackwatch/TrackWatchUser';
import { UserContext } from './UserContext';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<TrackWatchUser | null>(null);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};