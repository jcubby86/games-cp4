import { createContext, useContext, useEffect, useState } from 'react';

import {
  AppContextProps,
  AppContextProviderProps,
  AppState
} from './AppContextTypes';
import axios from '../utils/axiosWrapper';
import { logError } from '../utils/errorHandler';
import { PlayerDto } from '../utils/types';

export const AppContext = createContext<AppContextProps>({
  appState: {},
  setAppState: () => {}
});

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [appState, setAppState] = useState<AppState>({});

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPlayer() {
      try {
        const response = await axios.get<PlayerDto>('/api/player', controller);

        setAppState({
          nickname: response.data.nickname,
          playerId: response.data.uuid,
          gameCode: response.data.game.code,
          gameType: response.data.game.type,
          gameId: response.data.game.uuid
        });
      } catch (err: unknown) {
        logError(err);
      }
    }

    fetchPlayer();

    return () => controller.abort();
  }, []);

  return (
    <AppContext.Provider value={{ appState, setAppState }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppContextProvider');
  }
  return context;
};
