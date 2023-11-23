import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppState } from '../contexts/AppContext';
import axios from '../utils/axiosWrapper';
import { gameVariants } from '../utils/gameVariants';
import generateNickname from '../utils/nicknameGeneration';
import { GameDto, JoinGameReqBody, PlayerDto } from '../utils/types';
import { eqIgnoreCase as eq } from '../utils/utils';

interface JoinState {
  nickname: string;
  gameCode: string;
  gameId?: string;
  gameType?: string;
  valid?: boolean;
}

const Join = (): JSX.Element => {
  const suggestionRef = useRef(generateNickname());
  const { appState, setAppState } = useAppState();
  const [state, setState] = useState<JoinState>({
    nickname: appState.nickname,
    gameCode: appState.gameCode,
    gameId: appState.gameId
  });
  const navigate = useNavigate();

  const joinGame = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (state.gameCode?.length !== 4) {
        return;
      }

      const response = await axios.post<JoinGameReqBody, PlayerDto>(
        '/api/player',
        {
          nickname: state.nickname || suggestionRef.current,
          uuid: state.gameId ?? ''
        }
      );

      setAppState({
        nickname: response.data.nickname,
        playerId: response.data.uuid,
        gameCode: response.data.game.code,
        gameType: response.data.game.type,
        gameId: response.data.game.uuid
      });

      navigate('/' + response.data.game.type);
    } catch (err: unknown) {
      //TODO: improve error handling
      alert('Error joining game');
    }
  };

  const checkGameType = async (code: string) => {
    try {
      if (code.length === 4) {
        const result = await axios.get<GameDto>(`/api/game/${code}`);
        setState((prev) => ({
          ...prev,
          gameCode: code,
          gameType: result.data.type,
          gameId: result.data.uuid,
          valid: true
        }));
        return;
      }
    } catch (err: unknown) {
      console.error('Game not found');
    }
    setState((prev) => ({
      ...prev,
      gameCode: code,
      gameId: undefined,
      valid: code.length === 4 ? false : undefined
    }));
  };

  useEffect(() => {
    setState((prev) => ({ ...prev, nickname: appState.nickname }));
    checkGameType(appState.gameCode);
  }, [appState]);

  return (
    <div>
      <form className="row gap-3" onSubmit={joinGame}>
        <div className="col p-0">
          <label htmlFor="codeInput" className="form-label">
            Code:
          </label>
          <input
            id="codeInput"
            className="form-control"
            type="search"
            autoComplete="off"
            spellCheck="false"
            autoCorrect="off"
            placeholder="abxy"
            maxLength={4}
            value={state.gameCode}
            onChange={(e) => {
              e.preventDefault();
              checkGameType(e.target.value.toLowerCase());
            }}
          />
        </div>

        <div className="col p-0">
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

        <input
          disabled={!state.valid}
          type="submit"
          className="form-control btn btn-success col-12 mt-3"
          value={
            state.valid &&
            appState.gameCode &&
            appState.gameCode === state.gameCode
              ? 'Return to Game'
              : 'Join Game'
          }
        />
        <div className={state.gameId ? 'text-muted' : 'text-danger'}>
          {gameVariants.find((v) => eq(v.type, state.gameType))?.title ??
            (state.valid === false && 'Game not found')}
        </div>
      </form>
    </div>
  );
};

export default Join;
