import { useCallback, useEffect, useState } from 'react';
import { useUser } from '../context/useUser';
import { getTrackWatchUserData } from '../services/trackwatch/trackwatchUsers';

interface SessionManagerResult {
  loading: boolean;
  refreshSession: () => Promise<void>;
}

export const useSessionManager = (): SessionManagerResult => {
  const { setUserData } = useUser();
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const user = await getTrackWatchUserData();
    setUserData(user ?? null);
    setLoading(false);
  }, [setUserData]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return { loading, refreshSession };
};
