import { useRef } from 'react';

import List from './List';
import { useAppContext } from '../contexts/AppContext';
import axios from '../utils/axiosWrapper';
import { PLAY } from '../utils/constants';
import { alertError } from '../utils/errorHandler';
import { UpdateGameReqBody } from '../utils/types';

interface StartGameProps {
  setPhase: () => void;
  title: string;
  players?: string[];
  isHost?: boolean;
}

const StartGame = ({
  setPhase,
  title,
  players,
  isHost
}: StartGameProps): JSX.Element => {
  const { context } = useAppContext();
  const codeRef = useRef<HTMLInputElement>(null);

  const startGame = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      await axios.put<UpdateGameReqBody>(`/api/game/${context.gameId}`, {
        phase: PLAY
      });
      setPhase();
    } catch (err: unknown) {
      alertError('Unable to start game. Please try again', err);
    }
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
              value={context.gameCode}
              aria-label="game code"
              readOnly
              id="gameCode"
              style={{ minWidth: '100px' }}
              ref={codeRef}
              onClick={(e) => {
                e.preventDefault();
                codeRef.current?.select();
              }}
            />
          </div>
          <div className="mb-3 col p-0">
            <label htmlFor="playerCount" className="form-label">
              Player Count:
            </label>
            <input
              className="form-control"
              type="text"
              value={players?.length ?? 0}
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
        <List items={players} />
      </div>
    </>
  );
};

export default StartGame;
