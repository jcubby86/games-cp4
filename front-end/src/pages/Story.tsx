import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

import Icon from '../components/Icon';
import List from '../components/List';
import RecreateButton from '../components/RecreateButton';
import ShareButton from '../components/ShareButton';
import StartGame from '../components/StartGame';
import { useAppState } from '../contexts/AppContext';
import axios from '../utils/axiosWrapper';
import { JOIN, PLAY, READ, WAIT } from '../utils/constants';
import { StoryVariant } from '../utils/gameVariants';
import { EntryReqBody, StoryResBody } from '../utils/types';

const initialState = {
  phase: ''
};

const Story = (): JSX.Element => {
  const { appState } = useAppState();
  const [state, setState] = useState<StoryResBody>(initialState);
  const entryRef = useRef<HTMLTextAreaElement>(null);

  const pollStatus = async () => {
    try {
      const response = await axios.get<StoryResBody>('/api/story');
      setState({ ...response.data });
    } catch (err: unknown) {
      alert('An error has occurred');
    }
  };

  useEffect(() => {
    if (!state.phase) pollStatus();
    const timer = setInterval(() => {
      if (state.phase === JOIN || state.phase === WAIT) pollStatus();
    }, 3000);

    return () => clearInterval(timer);
  });

  const Play = (): JSX.Element => {
    const submit = async (e: React.FormEvent) => {
      try {
        e.preventDefault();
        if (!entryRef.current?.value) {
          if (
            !window.confirm(
              "You haven't typed anything in! Do you want to use the placeholder text?"
            )
          )
            return;
        }

        await axios.put<EntryReqBody>('/api/story', {
          value: (entryRef.current?.value || state.suggestion?.value) ?? ''
        });
        setState((prev) => ({ ...prev, phase: '' }));

        if (entryRef.current) {
          entryRef.current.value = '';
        }
      } catch (err: unknown) {
        alert('An error has occurred');
      }
    };

    const resetPlaceholder = async (e: React.MouseEvent) => {
      e.preventDefault();
      pollStatus();
    };

    return (
      <form className="w-100" onSubmit={submit}>
        <h3 className="text-center w-100">{state.prompt}</h3>
        <p className="form-label">
          {state.filler} {state.prefix}
        </p>
        <textarea
          placeholder={state.suggestion?.value}
          ref={entryRef}
          className="form-control"
          rows={3}
        />
        <p className="form-label">{state.suffix}</p>
        <div className="container-fluid mt-4">
          <div className="row gap-4">
            <input
              type="submit"
              value="Send"
              className="btn btn-success col-9"
            />
            <button
              className="btn btn-outline-secondary col"
              onClick={resetPlaceholder}
              data-tooltip-id="my-tooltip"
              data-tooltip-content="New Suggestion"
              data-tooltip-place="bottom"
            >
              <Icon icon="nf-fa-refresh" className="flex-grow-1"></Icon>
            </button>
          </div>
        </div>
        <Tooltip id="my-tooltip" />
      </form>
    );
  };

  const Read = (): JSX.Element => {
    const reset = () => {
      setState((prev) => ({
        ...prev,
        phase: JOIN,
        players: [appState.nickname],
        isHost: false
      }));
    };

    return (
      <div className="w-100">
        <p className="lh-lg fs-5 px-2 w-100">{state.story}</p>
        <div className="container-fluid">
          <div className="row gap-4">
            <RecreateButton reset={reset} className="col btn btn-success" />
            <Link
              to={`/story/${appState.gameId}`}
              className="col btn btn-outline-success"
            >
              See all
            </Link>
            <ShareButton
              className="btn col-2"
              path={`/story/${appState.gameId}/${appState.playerId}`}
              title={'Games: ' + StoryVariant.title}
              text="Read my hilarious story!"
            ></ShareButton>
          </div>
        </div>
      </div>
    );
  };

  const Wait = (): JSX.Element => {
    return (
      <div className="w-100">
        <h3 className="text-center w-100">Waiting for other players...</h3>
        {state.phase === WAIT && <List items={state.players}></List>}
      </div>
    );
  };

  if (state.phase === JOIN) {
    return (
      <StartGame
        players={state.players}
        isHost={state.isHost}
        title={StoryVariant.title}
        setPhase={() => setState((prev) => ({ ...prev, phase: '' }))}
      ></StartGame>
    );
  } else if (state.phase === PLAY) {
    return <Play />;
  } else if (state.phase === READ) {
    return <Read />;
  } else {
    return <Wait />;
  }
};

export default Story;
