import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import StartGame from '../components/StartGame';
import List from '../components/List';
import axios from 'axios';
import { JOIN, PLAY, READ, WAIT } from '../helpers/constants';
import Recreate from '../components/Recreate';
import { useAppState } from '../contexts/AppContext';
import { Tooltip } from 'react-tooltip';

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

  // const navigate = useNavigate();

  const pollStatus = async (resetPlaceholder = false) => {
    try {
      const response = await axios.get('/api/story');
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
    } catch (error) {
      alert('An error has occurred');
      // navigate('/');
    }
  };

  const getPlaceholder = (reset: boolean, old: string, new_: string): string =>
    reset || !old ? new_ : old;

  const reset = (newPhase: string, nickname: string) => {
    setState((prev) => ({
      ...prev,
      phase: newPhase,
      users: [nickname],
      isHost: false
    }));
  };

  const sendPart = async (e: React.FormEvent) => {
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
    } catch (error) {
      alert('An error has occurred');
      // navigate('/');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const share = async (_e: React.MouseEvent) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Games: He Said She Said',
          text: 'Read my hilarious story!',
          url:
            document.querySelector<HTMLAnchorElement>('.navbar-brand')?.href +
            `story/${state.id}/${appState.userId}`
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetPlaceholder = async (_e: React.MouseEvent) => {
    try {
      _e.stopPropagation();
      pollStatus(true);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!state.phase) pollStatus();
    const timer = setInterval(() => {
      if (state.phase === JOIN || state.phase === WAIT) pollStatus();
    }, 3000);

    return () => clearInterval(timer);
  });

  if (state.phase === JOIN) {
    return (
      <>
        <StartGame
          users={state.users}
          isHost={state.isHost}
          title={'He Said She Said'}
          setPhase={(newPhase) =>
            setState((prev) => ({ ...prev, phase: newPhase }))
          }
        ></StartGame>
      </>
    );
  } else if (state.phase === PLAY) {
    return (
      <form className="w-100" onSubmit={sendPart}>
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
              // STYLE="--bs-btn-font-size: .6rem;"
              onClick={resetPlaceholder}
              data-tooltip-id="my-tooltip"
              data-tooltip-content="New Suggestion"
              data-tooltip-place="bottom"
            >
              <span className="icon flex-grow-1">
                <i className="nf-fa-refresh" />
              </span>
            </button>
          </div>
        </div>
        <Tooltip id="my-tooltip" />
      </form>
    );
  } else if (state.phase === READ) {
    return (
      <div className="w-100">
        <p className="lh-lg fs-5 px-2 w-100">{state.story}</p>
        <div>
          <Recreate reset={reset} />
          {navigator['share'] && (
            <button onClick={share} className={'btn'}>
              <span className="icon py-1">
                <i className="nf-fa-share_square_o" />
              </span>
            </button>
          )}
        </div>
      </div>
    );
  } else {
    return (
      <div className="w-100">
        <h3 className="text-center w-100">Waiting for other players...</h3>
        {state.phase === WAIT && <List items={state.users}></List>}
      </div>
    );
  }
};

export default Story;
