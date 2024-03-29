import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppState } from '../contexts/AppContext';
import axios from '../utils/axiosWrapper';
import handleError from '../utils/errorHandler';
import { gameVariants } from '../utils/gameVariants';
import generateNickname from '../utils/nicknameGeneration';
import {
  CreateGameReqBody as CreateGameReq,
  GameDto as Game,
  JoinGameReqBody as JoinGameReq,
  PlayerDto
} from '../utils/types';

interface CreateState {
  nickname: string;
  selected: string;
}

const Create = (): JSX.Element => {
  const { appState, setAppState } = useAppState();
  const suggestionRef = useRef(generateNickname());
  const [state, setState] = useState<CreateState>({
    nickname: appState.nickname,
    selected: ''
  });
  const navigate = useNavigate();

  const createGame = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!gameVariants.map((t) => t.type).includes(state.selected)) {
        alert('Please select a game type');
        return;
      }

      const gameResponse = await axios.post<CreateGameReq, Game>('/api/game', {
        type: state.selected
      });
      const playerResponse = await axios.post<JoinGameReq, PlayerDto>(
        '/api/player',
        {
          nickname: state.nickname || suggestionRef.current,
          uuid: gameResponse.data.uuid
        }
      );

      setAppState({
        nickname: playerResponse.data.nickname,
        playerId: playerResponse.data.uuid,
        gameCode: gameResponse.data.code,
        gameType: gameResponse.data.type,
        gameId: gameResponse.data.uuid
      });
      navigate('/' + gameResponse.data.type);
    } catch (err: unknown) {
      handleError(
        'Unable to create game. Please try again in a little bit.',
        err
      );
    }
  };

  useEffect(() => {
    setState((prev) => ({ ...prev, nickname: appState.nickname }));
  }, [appState]);

  const Description = (): JSX.Element => {
    if (state.selected) {
      return (
        <p className="p-3 text-wrap">
          {gameVariants.find((v) => v.type === state.selected)?.description}
        </p>
      );
    } else {
      return <></>;
    }
  };

  return (
    <div className="w-100">
      <form onSubmit={createGame}>
        <div className="mb-3">
          <label htmlFor="nicknameInput" className="form-label">
            Nickname:
          </label>
          <input
            id="nicknameInput"
            className="form-control"
            type="search"
            autoComplete="off"
            spellCheck="false"
            autoCorrect="off"
            placeholder={suggestionRef.current}
            maxLength={30}
            value={state.nickname}
            onChange={(e) => {
              e.preventDefault();
              setState((prev) => ({ ...prev, nickname: e.target.value }));
            }}
          />
        </div>
        <div
          className="btn-group-vertical d-block text-center m-4"
          role="group"
          aria-label="Game Type"
        >
          {gameVariants.map((variant) => {
            return (
              <button
                className={
                  'btn opacity-75 ' +
                  (state.selected === variant.type
                    ? 'btn-primary'
                    : 'btn-outline-primary')
                }
                onClick={(e) => {
                  e.preventDefault();
                  setState((prev) => ({ ...prev, selected: variant.type }));
                }}
                key={variant.type}
              >
                {variant.title}
              </button>
            );
          })}
        </div>
        <input
          type="submit"
          value="Create Game"
          className="form-control btn btn-success"
        />
      </form>
      <Description />
    </div>
  );
};

export default Create;
