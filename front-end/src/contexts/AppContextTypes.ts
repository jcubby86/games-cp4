export interface AppState {
  nickname: string;
  gameCode: string;
  gameType: string;
  playerId: string;
  gameId: string;
}
export interface AppContextProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}
export interface AppContextProviderProps {
  children: React.ReactElement;
}
