import List from './List';
import { useAppState } from '../contexts/AppContext';
import axios from '../utils/axiosWrapper';
import { PLAY } from '../utils/constants';
import { UpdateGameReqBody } from '../utils/types';

interface StartGameProps {
  setPhase: () => unknown;
  title: string;
  users?: string[];
  isHost?: boolean;
}

const StartGame = ({
  setPhase,
  title,
  users,
  isHost
}: StartGameProps): JSX.Element => {
  const { appState } = useAppState();
  const startGame = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.put<UpdateGameReqBody>(`/api/game/${appState.gameId}`, {
      phase: PLAY
    });
    setPhase();
  };

  return (
    <>
      <div className="w-100">
        <div className="text-center mb-4">
          <h1 className="text-nowrap">{title}</h1>
        </div>
        <form className="row gap-3" onSubmit={startGame}>
          <div className="mb-3 col p-0">
            <label htmlFor="gameCode" className="form-label">
              Game Code:
            </label>
            <input
              className="form-control"
              type="text"
              value={appState.gameCode}
              aria-label="game code"
              readOnly
              id="gameCode"
              style={{ minWidth: '100px' }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(e: any) => e.target.select()}
            />
          </div>
          <div className="mb-3 col p-0">
            <label htmlFor="playerCount" className="form-label">
              Player Count:
            </label>
            <input
              className="form-control"
              type="text"
              value={users?.length ?? 0}
              aria-label="player count"
              readOnly
              id="playerCount"
            />
          </div>
          {isHost && (
            <input
              type="submit"
              value="Start Game"
              className="form-control btn btn-success mt-4 col-12"
            />
          )}
        </form>
        <h3 className="text-center mt-5">Players:</h3>
        <List items={users}></List>
      </div>
    </>
  );
};

export default StartGame;
