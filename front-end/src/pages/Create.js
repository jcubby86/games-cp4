import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const Create = () => {
  const [nickname, setNickname] = useState('');
  const [selected, setSelected] = useState('');
  const [redirect, setRedirect] = useState('');

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/users');
      setNickname(response.data.nickname);
    } catch (err) {
      return;
    }
  };

  const createGame = async (e) => {
    e.preventDefault();
    try {
      if (nickname === '' || selected === '') {
        alert('Please enter a nickname and select a game type');
        return;
      }

      const gameResponse = await axios.post('/api/games', {
        creator: nickname.toLowerCase(),
        type: selected,
      });
      const userResponse = await axios.post('/api/users', {
        nickname: nickname.toLowerCase(),
        code: gameResponse.data.code,
      });
      setRedirect('/' + userResponse.data.game.type);
    } catch (err) {
      alert('Please enter a valid game code');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (redirect !== '') {
    return <Navigate to={redirect} />;
  }

  return (
    <div>
      <form onSubmit={createGame}>
        <input
          type="text"
          autoComplete="off"
          spellCheck="false"
          autoCorrect="off"
          placeholder="enter a nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={(e) => {
            e.preventDefault();
            setSelected('story');
          }}
        >
          He Said She Said
        </button>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

export default Create;
