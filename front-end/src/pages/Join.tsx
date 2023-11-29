import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppState } from '../contexts/AppContext';
import axios from '../utils/axiosWrapper';
import { alertError, logError } from '../utils/errorHandler';
import { gameVariants } from '../utils/gameVariants';
import generateNickname from '../utils/nicknameGeneration';
import { GameDto, JoinGameReqBody, PlayerDto } from '../utils/types';
import { eqIgnoreCase as eq } from '../utils/utils';

type JoinState =
  | { validity: 'valid'; gameId: string; gameType: string }
  | { validity: 'unknown' | 'invalid' };

const Join = (): JSX.Element => {
  const { appState, setAppState } = useAppState();
  const [code, setCode] = useState(appState.gameCode ?? '');
  const [state, setState] = useState<JoinState>({ validity: 'unknown' });
  const nicknameRef = useRef<HTMLInputElement>(null);
  const suggestionRef = useRef(generateNickname());
  const navigate = useNavigate();

  const joinGame = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (state.validity !== 'valid') {
        return;
      }

      const response = await axios.post<JoinGameReqBody, PlayerDto>(
        '/api/player',
        {
          nickname: nicknameRef.current?.value || suggestionRef.current,
          uuid: state.gameId
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
      alertError('Error joining game', err);
    }
  };

  useEffect(() => {
    setCode(appState.gameCode ?? code);
  }, [appState.gameCode]);

  useEffect(() => {
    const controller = new AbortController();
    async function checkGameType(code: string) {
      try {
        if (code.length === 4) {
          const result = await axios.get<GameDto>(
            `/api/game/${code}`,
            controller
          );
          setState({
            gameType: result.data.type,
            gameId: result.data.uuid,
            validity: 'valid'
          });
        } else {
          setState({ validity: 'unknown' });
        }
      } catch (err: unknown) {
        logError(err);
        setState({ validity: 'invalid' });
      }
    }

    checkGameType(code);
    return () => controller.abort();
  }, [code]);

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
            value={code}
            onChange={(e) => {
              e.preventDefault();
              setCode(e.target.value.toLowerCase());
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
            defaultValue={appState.nickname}
            ref={nicknameRef}
          />
        </div>

        <input
          disabled={state.validity !== 'valid'}
          type="submit"
          className="form-control btn btn-success col-12 mt-3"
          value={
            state.validity === 'valid' && appState.gameCode === code
              ? 'Return to Game'
              : 'Join Game'
          }
        />
        {state.validity === 'valid' && (
          <div className="text-muted">
            {gameVariants.find((v) => eq(v.type, state.gameType))?.title}
          </div>
        )}
        {state.validity === 'invalid' && (
          <div className="text-danger">Game not found</div>
        )}
      </form>
    </div>
  );
};

export default Join;
