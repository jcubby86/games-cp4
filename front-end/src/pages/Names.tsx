import { useEffect, useRef, useState } from 'react';

import List from '../components/List';
import RecreateButton from '../components/RecreateButton';
import StartGame from '../components/StartGame';
import { useAppContext } from '../contexts/AppContext';
import axios from '../utils/axiosWrapper';
import { END, JOIN, PLAY, READ, WAIT } from '../utils/constants';
import { alertError, logError } from '../utils/errorHandler';
import { NameVariant } from '../utils/gameVariants';
import { EntryReqBody, NamesResBody, UpdateGameReqBody } from '../utils/types';

const Names = (): JSX.Element => {
  const { context } = useAppContext();
  const [state, setState] = useState<NamesResBody>({ phase: '' });
  const entryRef = useRef<HTMLInputElement>(null);

  const pollStatus = async (controller?: AbortController) => {
    try {
      const response = await axios.get<NamesResBody>('/api/names', controller);
      setState({ ...response.data });
    } catch (err: unknown) {
      logError(err);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    if (!state.phase) pollStatus(controller);
    const timer = setInterval(() => {
      if (state.phase === JOIN || state.phase === WAIT || state.phase === READ)
        pollStatus(controller);
    }, 3000);

    return () => {
      controller.abort();
      clearInterval(timer);
    };
  });

  const Play = (): JSX.Element => {
    const sendEntry = async (e: React.FormEvent) => {
      try {
        e.preventDefault();
        if (!entryRef.current?.value) {
          alert('Please enter a name');
          return;
        }

        await axios.put<EntryReqBody>('/api/names', {
          value: entryRef.current.value
        });
        setState((prev) => ({ ...prev, phase: '' }));
      } catch (err: unknown) {
        alertError('Error saving entry', err);
      }
    };

    return (
      <form className="w-100" onSubmit={sendEntry}>
        <h3 className="text-center w-100">Enter a name:</h3>
        <input
          placeholder={state.suggestion?.value}
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
      try {
        e.preventDefault();
        await axios.put<UpdateGameReqBody>(`/api/game/${context.gameId}`, {
          phase: END
        });
        setState((prev) => ({
          ...prev,
          phase: END
        }));
      } catch (err: unknown) {
        alertError('Error updating game', err);
      }
    };

    return (
      <div className="w-100 d-flex flex-column">
        <div className="w-100">
          <h3 className="text-center w-100">Names:</h3>
          <List items={state.names ?? []} />
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
        players: [context.nickname!],
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
        {state.phase === WAIT && <List items={state.players} />}
      </div>
    );
  };

  if (state.phase === JOIN) {
    return (
      <StartGame
        players={state.players}
        isHost={state.isHost}
        title={NameVariant.title}
        setPhase={() => setState((prev) => ({ ...prev, phase: '' }))}
      />
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
