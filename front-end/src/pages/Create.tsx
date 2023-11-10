import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppState } from '../contexts/AppContext';
import axios from '../utils/axiosWrapper';
import { NAMES, STORY } from '../utils/constants';
import generateNickname from '../utils/nicknameGeneration';
import {
  CreateGameRequestBody,
  GameDto,
  JoinGameRequestBody,
  UserDto
} from '../utils/types';

interface CreateState {
  nickname: string;
  selected: string;
}

const Create = (): JSX.Element => {
  const { appState, setAppState } = useAppState();
  const suggestion = useRef(generateNickname());
  const [state, setState] = useState<CreateState>({
    nickname: appState.nickname,
    selected: STORY
  });
  const navigate = useNavigate();

  const createGame = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (state.selected === '') {
        alert('Please select a valid game type');
        return;
      }

      const gameResponse = await axios.post<CreateGameRequestBody, GameDto>(
        '/api/game',
        {
          type: state.selected
        }
      );
      const userResponse = await axios.post<JoinGameRequestBody, UserDto>(
        '/api/user',
        {
          nickname: state.nickname.toLowerCase() || suggestion.current,
          code: gameResponse.data.code
        }
      );

      setAppState({
        nickname: userResponse.data.nickname,
        userId: userResponse.data.uuid,
        gameCode: gameResponse.data.code,
        gameType: gameResponse.data.type
      });
      navigate('/' + gameResponse.data.type.toLowerCase());
    } catch (err: unknown) {
      alert('Unable to create game. Please try again in a little bit.');
    }
  };

  useEffect(() => {
    setState((prev) => ({ ...prev, nickname: appState.nickname }));
  }, [appState]);

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
            placeholder={suggestion.current}
            maxLength={30}
            value={state.nickname}
            onChange={(e) =>
              setState((prev) => ({ ...prev, nickname: e.target.value }))
            }
          />
        </div>
        <div className="mb-3">
          <div
            className="btn-group d-block text-center m-4"
            role="group"
            aria-label="Game Type"
          >
            <button
              className={
                'btn opacity-75 ' +
                (state.selected === STORY
                  ? 'btn-primary'
                  : 'btn-outline-primary')
              }
              onClick={(e) => {
                e.preventDefault();
                setState((prev) => ({ ...prev, selected: STORY }));
              }}
            >
              He Said She Said
            </button>
            <button
              className={
                'btn opacity-75 ' +
                (state.selected === NAMES
                  ? 'btn-primary'
                  : 'btn-outline-primary')
              }
              onClick={(e) => {
                e.preventDefault();
                setState((prev) => ({ ...prev, selected: NAMES }));
              }}
            >
              Name Game
            </button>
          </div>
        </div>
        <input
          type="submit"
          value="Create Game"
          className="form-control btn btn-success"
        />
      </form>
      {state.selected === STORY && (
        <p className="p-3 text-wrap">
          Create a fun story reminiscent of mad libs together!
        </p>
      )}
      {state.selected === NAMES && (
        <p className="p-3 text-wrap">
          Everyone secretly enters the name of a person (real or fictional) that
          others would know. Players then take turns guessing each other's names
          until only one remains!
        </p>
      )}
    </div>
  );
};

export default Create;
