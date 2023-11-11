import { createContext, useContext, useEffect, useState } from 'react';

import {
  AppContextProps,
  AppContextProviderProps,
  AppState
} from './AppContextTypes';
import axios from '../utils/axiosWrapper';
import { UserDto } from '../utils/types';

const initialAppState: AppState = {
  nickname: '',
  userId: '',
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

  const fetchUser = async () => {
    try {
      const response = await axios.get<UserDto>('/api/user');

      setAppState({
        nickname: response.data.nickname,
        userId: response.data.uuid,
        gameCode: response.data.game.code,
        gameType: response.data.game.type,
        gameId: response.data.game.uuid
      });
    } catch (err: unknown) {
      return;
    }
  };

  useEffect(() => {
    fetchUser();
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
