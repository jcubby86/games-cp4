import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import generateNickname from '../helpers/nicknameGeneration';
import { useAppState } from '../contexts/AppContext';

interface GameType {
  title?: string | null;
  valid?: boolean | null;
}
interface JoinState {
  nickname: string;
  gameCode: string;
  gameType: GameType;
}

const Join = (): JSX.Element => {
  const suggestion = useRef(generateNickname());
  const { appState, setAppState } = useAppState();
  const [state, setState] = useState<JoinState>({
    nickname: appState.nickname,
    gameCode: appState.gameCode,
    gameType: {}
  });
  const navigate = useNavigate();

  const joinGame = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (state.gameCode?.length !== 4) {
        alert('Please enter a code.');
        return;
      }

      const response = await axios.post('/api/user', {
        nickname: state.nickname.toLowerCase() || suggestion.current,
        code: state.gameCode.toLowerCase()
      });

      setAppState({
        nickname: response.data.nickname,
        userId: response.data._id,
        gameCode: response.data.game.code,
        gameType: response.data.game.type
      });

      navigate('/' + response.data.type.toLowerCase());
    } catch (e: unknown) {
      const err = e as AxiosError;
      if (err?.response?.status === 400) {
        alert(err.response.data);
      } else {
        alert('Error joining game');
      }
    }
  };

  const checkGameType = async (code: string) => {
    let gameType: GameType = {};
    try {
      if (code.length === 4) {
        const result = await axios.get('/api/game/' + code);
        gameType = {
          title: result.data.title,
          valid: true
        };
      }
    } catch (error) {
      gameType = { title: 'Game not found', valid: false };
    }
    setState((prev) => ({ ...prev, gameCode: code, gameType: gameType }));
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
            onChange={(e) => checkGameType(e.target.value.toLowerCase())}
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
            placeholder={suggestion.current}
            maxLength={30}
            value={state.nickname}
            onChange={(e) =>
              setState((prev) => ({ ...prev, nickname: e.target.value }))
            }
          />
        </div>

        <input
          disabled={!state.gameType.valid}
          type="submit"
          className="form-control btn btn-success col-12 mt-3"
          value={
            state.gameType.valid &&
            appState.gameCode &&
            appState.gameCode === state.gameCode
              ? 'Return to Game'
              : 'Join Game'
          }
        />
        <div className={state.gameType.valid ? 'text-muted' : 'text-danger'}>
          {state.gameType.title}
        </div>
      </form>
    </div>
  );
};

export default Join;
