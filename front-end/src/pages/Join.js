import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const Join = () => {
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [redirect, setRedirect] = useState('');

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/users');
      setNickname(response.data.nickname);
      setCode(response.data.game.code);
    } catch (err) {
      return;
    }
  };

  const joinGame = async (e) => {
    try {
      e.preventDefault();
      if (nickname === '' || code?.length !== 4) {
        alert('Please enter a nickname and a code.');
        return;
      }

      const response = await axios.post('/api/users', {
        nickname: nickname.toLowerCase(),
        code: code.toLowerCase(),
      });

      setRedirect('/' + response.data.game.type);
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
      <form onSubmit={joinGame}>
        <input
          type="text"
          autoComplete="off"
          spellCheck="false"
          autoCorrect="off"
          placeholder="enter a nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <input
          type="text"
          autoComplete="off"
          spellCheck="false"
          autoCorrect="off"
          placeholder="enter 4-letter code"
          maxLength="4"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

export default Join;
