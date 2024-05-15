import {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useReducer
} from 'react';

import axios from '../utils/axiosWrapper';
import { logError } from '../utils/errorHandler';
import { PlayerDto } from '../utils/types';

export interface AppState {
  nickname?: string;
  gameCode?: string;
  gameType?: string;
  playerId?: string;
  gameId?: string;
}

type Action = { type: 'leave' } | { type: 'join'; player: PlayerDto };

const reducer = (prev: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'leave':
      return {
        ...prev,
        gameCode: undefined,
        gameType: undefined,
        gameId: undefined
      };
    case 'join': {
      const player = action.player;
      return {
        nickname: player.nickname,
        playerId: player.uuid,
        gameCode: player.game.code,
        gameType: player.game.type,
        gameId: player.game.uuid
      };
    }
  }
};

const AppContext = createContext<AppState>({});
const AppDispatchContext = createContext<Dispatch<Action>>(() => {});

export const AppContextProvider = ({
  children
}: {
  children: React.ReactElement;
}) => {
  const [context, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPlayer() {
      try {
        const response = await axios.get<PlayerDto>('/api/player', controller);

        dispatch({ type: 'join', player: response.data });
      } catch (err: unknown) {
        logError(err);
      }
    }

    fetchPlayer();

    return () => controller.abort();
  }, []);

  return (
    <AppContext.Provider value={context}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return {
    context: useContext(AppContext),
    dispatchContext: useContext(AppDispatchContext)
  };
};
