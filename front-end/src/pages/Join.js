import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Join = (props) => {
  const [nickname, setNickname] = useState(props.nickname);
  const [code, setCode] = useState(props.code);
  const navigate = useNavigate();

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

      props.setNickname(response.data.nickname);
      props.setCode(response.data.game.code);
      props.setGameType(response.data.game.type);
      navigate('/' + response.data.game.type);
    } catch (err) {
      alert('Please enter a valid game code');
    }
  };

  useEffect(() => {
    setNickname(props.nickname);
    setCode(props.code);
  }, [props]);

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
        <input
          type="submit"
          value={props.code && props.code === code ? 'Return to Game' : 'Join'}
        />
      </form>
    </div>
  );
};

export default Join;
