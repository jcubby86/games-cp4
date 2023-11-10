import { useState, useEffect, useRef } from 'react';
import StartGame from '../components/StartGame';
import List from '../components/List';
import axios from '../helpers/axiosWrapper';
import { JOIN, PLAY, READ, WAIT } from '../helpers/constants';
import RecreateButton from '../components/RecreateButton';
import { useAppState } from '../contexts/AppContext';
import { Tooltip } from 'react-tooltip';
import ShareButton from '../components/ShareButton';
import Icon from '../components/Icon';
import { Link } from 'react-router-dom';
import { StoryResponseBody } from '../helpers/types';

interface StoryState {
  phase: string;
  users: string[];
  prompt: string;
  placeholder: string;
  prefix: string;
  suffix: string;
  story: string;
  filler: string;
  id: string;
  isHost: boolean;
}

const initialState: StoryState = {
  phase: '',
  users: [],
  prompt: '',
  placeholder: '',
  prefix: '',
  suffix: '',
  story: '',
  filler: '',
  id: '',
  isHost: false
};

const Story = (): JSX.Element => {
  const { appState } = useAppState();
  const [state, setState] = useState<StoryState>(initialState);
  const partRef = useRef<HTMLTextAreaElement>(null);

  const pollStatus = async (resetPlaceholder = false) => {
    try {
      const response = await axios.get<StoryResponseBody>('/api/story');
      setState(
        (prev): StoryState => ({
          ...response.data,
          placeholder: getPlaceholder(
            resetPlaceholder,
            prev.placeholder,
            response.data.placeholder
          )
        })
      );
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

  const getPlaceholder = (reset: boolean, old: string, new_: string): string =>
    reset || !old ? new_ : old;

  const Play = (): JSX.Element => {
    const submit = async (e: React.FormEvent) => {
      try {
        e.preventDefault();
        if (!partRef.current?.value) {
          if (
            !window.confirm(
              "You haven't typed anything in! Do you want to use the placeholder text?"
            )
          )
            return;
        }

        await axios.put('/api/story', {
          part: partRef.current?.value || state.placeholder
        });
        setState((prev) => ({ ...prev, phase: '', placeholder: '' }));

        if (partRef.current) {
          partRef.current.value = '';
        }
      } catch (err: unknown) {
        alert('An error has occurred');
      }
    };

    const resetPlaceholder = async (_e: React.MouseEvent) => {
      try {
        _e.stopPropagation();
        pollStatus(true);
      } catch (err: unknown) {
        console.error(err);
      }
    };

    return (
      <form className="w-100" onSubmit={submit}>
        <h3 className="text-center w-100">{state.prompt}</h3>
        <p className="form-label">
          {state.filler} {state.prefix}
        </p>
        <textarea
          placeholder={state.placeholder}
          ref={partRef}
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
              type="button"
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
        users: [appState.nickname],
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
              to={`/story/${state.id}`}
              className="col btn btn-outline-success"
            >
              See all
            </Link>
            <ShareButton
              className="btn col-2"
              path={`/story/${state.id}/${appState.userId}`}
              title="Games: He Said She Said"
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
        {state.phase === WAIT && <List items={state.users}></List>}
      </div>
    );
  };

  if (state.phase === JOIN) {
    return (
      <StartGame
        users={state.users}
        isHost={state.isHost}
        title="He Said She Said"
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
