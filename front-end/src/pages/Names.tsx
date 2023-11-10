import { useState, useEffect, useRef } from 'react';
import StartGame from '../components/StartGame';
import List from '../components/List';
import axios, { AxiosError } from '../utils/axiosWrapper';
import { useAppState } from '../contexts/AppContext';
import { END, JOIN, PLAY, READ, WAIT } from '../utils/constants';
import RecreateButton from '../components/RecreateButton';
import { NamesResponseBody } from '../utils/types';

const initialState = {
  phase: ''
};

const Names = (): JSX.Element => {
  const { appState } = useAppState();
  const [state, setState] = useState<NamesResponseBody>(initialState);
  const entryRef = useRef<HTMLInputElement>(null);

  const pollStatus = async () => {
    try {
      const response = await axios.get<NamesResponseBody>('/api/names');
      setState((prev) => ({
        phase: response.data.phase,
        users: response.data.users,
        names: response.data.names,
        isHost: response.data.isHost,
        placeholder: prev.placeholder || response.data.placeholder
      }));
    } catch (err: unknown) {
      alert('An error has occurred');
    }
  };

  useEffect(() => {
    if (!state.phase) pollStatus();
    const timer = setInterval(() => {
      if (state.phase === JOIN || state.phase === WAIT || state.phase === READ)
        pollStatus();
    }, 3000);

    return () => clearInterval(timer);
  });

  const Play = (): JSX.Element => {
    const sendEntry = async (e: React.FormEvent) => {
      try {
        e.preventDefault();
        if (!entryRef.current?.value) {
          alert('Please enter a name');
          return;
        }

        await axios.put('/api/names', {
          text: entryRef.current.value
        });
        setState((prev) => ({
          ...prev,
          phase: '',
          placeholder: ''
        }));
      } catch (e: unknown) {
        const err = e as AxiosError;
        if (err?.response?.status === 400) {
          alert(err.response.data);
        } else {
          alert('An error has occurred');
        }
      }
    };

    return (
      <form className="w-100" onSubmit={sendEntry}>
        <h3 className="text-center w-100">Enter a name:</h3>
        <input
          placeholder={state.placeholder}
          ref={entryRef}
          className="form-control"
        />
        <input
          type="submit"
          value="Send"
          className="form-control btn btn-success mt-3"
        />
      </form>
    );
  };

  const Read = (): JSX.Element => {
    const endGame = async (e: React.MouseEvent) => {
      e.preventDefault();
      await axios.put(`/api/game/${appState.gameCode}`, { phase: END });
      setState((prev) => ({
        ...prev,
        phase: END
      }));
    };

    return (
      <div className="w-100 d-flex flex-column">
        <div className="w-100">
          <h3 className="text-center w-100">Names:</h3>
          <List items={state.names ?? []}></List>
        </div>

        {state.isHost && (
          <button className={'btn btn-danger mt-4'} onClick={endGame}>
            Hide Names
          </button>
        )}
      </div>
    );
  };

  const End = (): JSX.Element => {
    const reset = () => {
      setState((prev) => ({
        ...prev,
        phase: JOIN,
        users: [appState.nickname],
        isHost: false
      }));
    };

    return (
      <div className="w-100">
        <h3 className="w-100 text-center pb-3">Enjoy the game!</h3>
        <div className="d-flex justify-content-center">
          <RecreateButton reset={reset} className="btn btn-success" />
        </div>
      </div>
    );
  };

  const Wait = (): JSX.Element => {
    return (
      <div className="w-100">
        <h3 className="text-center w-100">Waiting for other players...</h3>
        {state.phase === WAIT && <List items={state.users}></List>}
      </div>
    );
  };

  if (state.phase === JOIN) {
    return (
      <StartGame
        users={state.users}
        isHost={state.isHost}
        title="The Name Game"
        setPhase={() => setState((prev) => ({ ...prev, phase: '' }))}
      ></StartGame>
    );
  } else if (state.phase === PLAY) {
    return <Play />;
  } else if (state.phase === READ) {
    return <Read />;
  } else if (state.phase === END) {
    return <End />;
  } else {
    return <Wait />;
  }
};

export default Names;
