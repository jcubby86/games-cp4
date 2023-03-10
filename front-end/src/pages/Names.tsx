import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import StartGame from '../components/StartGame';
import List from '../components/List';
import axios, { AxiosError } from 'axios';
import { useAppState } from '../contexts/AppContext';

const Names = (): JSX.Element => {
  const { appState } = useAppState();
  const [phase, setPhase] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const [names, setNames] = useState<string[]>([]);
  const [placeholder, setPlaceholder] = useState('');
  const entryRef = useRef<HTMLInputElement>(null);

  // const navigate = useNavigate();

  const pollStatus = async () => {
    try {
      const response = await axios.get('/api/names');
      setPhase(response.data.phase);
      setUsers(response.data.users);
      setNames(response.data.names);
      setPlaceholder((old) => old || response.data.placeholder);
    } catch (error) {
      alert('An error has occurred');
      // navigate('/');
    }
  };

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
      setPhase('');
      setPlaceholder('');
    } catch (e: unknown) {
      const err = e as AxiosError;
      if (err?.response?.status === 400) {
        alert(err.response.data);
      } else {
        alert('An error has occurred');
        // navigate('/');
      }
    }
  };

  const endGame = async (e: React.MouseEvent) => {
    e.preventDefault();
    await axios.put(`/api/game/${appState.gameCode}`, { phase: 'end' });
    setPhase('end');
  };

  useEffect(() => {
    if (!phase) pollStatus();
    const timer = setInterval(() => {
      if (phase === 'join' || phase === 'wait' || phase === 'read')
        pollStatus();
    }, 3000);

    return () => clearInterval(timer);
  });

  if (phase === 'join') {
    return (
      <StartGame
        users={users}
        title={'The Name Game'}
        setPhase={setPhase}
      ></StartGame>
    );
  } else if (phase === 'play') {
    return (
      <form className="w-100" onSubmit={sendEntry}>
        <h3 className="text-center w-100">Enter a name:</h3>
        <input
          placeholder={placeholder}
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
  } else if (phase === 'read') {
    return (
      <div className="w-100 d-flex flex-column">
        <div className="w-100">
          <h3 className="text-center w-100">Names:</h3>
          <List items={names}></List>
        </div>

        <button className={'btn btn-danger mt-4'} onClick={endGame}>
          Hide Names
        </button>
      </div>
    );
  } else if (phase === 'end') {
    return <h3 className="w-100 text-center">Enjoy the game!</h3>;
  } else {
    return (
      <div className="w-100">
        <h3 className="text-center w-100">Waiting for other players...</h3>
        {phase === 'wait' && <List items={users}></List>}
      </div>
    );
  }
};

export default Names;
