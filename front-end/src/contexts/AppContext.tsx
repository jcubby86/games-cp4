import { createContext, useContext, useEffect, useState } from 'react';

import {
  AppContextProps,
  AppContextProviderProps,
  AppState
} from './AppContextTypes';
import axios from '../utils/axiosWrapper';
import { PlayerDto } from '../utils/types';

const initialAppState: AppState = {
  nickname: '',
  playerId: '',
  gameCode: '',
  gameType: '',
  gameId: ''
};

export const AppContext = createContext<AppContextProps>({
  appState: initialAppState,
  setAppState: () => {}
});

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [appState, setAppState] = useState<AppState>(initialAppState);

  const fetchPlayer = async () => {
    try {
      const response = await axios.get<PlayerDto>('/api/player');

      setAppState({
        nickname: response.data.nickname,
        playerId: response.data.uuid,
        gameCode: response.data.game.code,
        gameType: response.data.game.type,
        gameId: response.data.game.uuid
      });
    } catch (err: unknown) {
      return;
    }
  };

  useEffect(() => {
    fetchPlayer();
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
