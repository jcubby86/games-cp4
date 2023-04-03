export interface AppState {
  nickname: string;
  gameCode: string;
  gameType: string;
  userId: string;
}
export interface AppContextProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}
export interface AppContextProviderProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: React.ReactElement<any, any>;
}
