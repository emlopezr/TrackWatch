import { useState, ReactNode } from 'react';
import { TrackifyUser } from '../types/trackify/TrackifyUser';
import { UserContext } from './UserContext';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userData, setUserData] = useState<TrackifyUser | null>(null);

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
};