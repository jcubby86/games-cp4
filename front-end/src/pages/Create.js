import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Create = (props) => {
  const [nickname, setNickname] = useState(props.nickname);
  const [selected, setSelected] = useState('story');
  const navigate = useNavigate();

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
      props.setCode(gameResponse.data.code);
      props.setNickname(userResponse.data.nickname);
      props.setGameType(gameResponse.data.type);
      navigate('/' + gameResponse.data.type);
    } catch (err) {
      alert('Please enter a valid game code');
    }
  };

  useEffect(() => {
    setNickname(props.nickname);
  }, [props]);

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
