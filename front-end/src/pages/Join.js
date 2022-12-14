import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import generateNickname from '../helpers/nicknameGeneration';

const Join = (props) => {
  const suggestion = useRef(generateNickname());
  const [nickname, setNickname] = useState(props.nickname);
  const [code, setCode] = useState(props.code);
  const [gameType, setGameType] = useState({});
  const navigate = useNavigate();

  const joinGame = async (e) => {
    try {
      e.preventDefault();
      if (code?.length !== 4) {
        alert('Please enter a code.');
        return;
      }

      const response = await axios.post('/api/users', {
        nickname: nickname.toLowerCase() || suggestion.current,
        code: code.toLowerCase(),
      });

      props.setNickname(response.data.nickname);
      props.setCode(response.data.game.code);
      props.setGameType(response.data.game.type);
      navigate('/' + response.data.game.type);
    } catch (err) {
      if (err.response.status === 400) {
        alert(err.response.data);
      } else {
        alert('Error joining game');
      }
    }
  };

  const checkGameType = async (gameCode) => {
    try {
      setCode(gameCode);
      if (gameCode.length === 4) {
        const result = await axios.get('/api/games/' + gameCode);
        setGameType({
          title: result.data.title,
          valid: true,
        });
      } else {
        setGameType({});
      }
    } catch (error) {
      setGameType({ title: 'Game not found', valid: false });
    }
  };

  useEffect(() => {
    setNickname(props.nickname);
    checkGameType(props.code);
  }, [props]);

  return (
    <div>
      <form className="row gap-3" onSubmit={joinGame}>
        <div className="col p-0">
          <label htmlFor="codeInput" className="form-label">
            Code:
          </label>
          <input
            id="codeInput"
            className="form-control"
            type="search"
            autoComplete="off"
            spellCheck="false"
            autoCorrect="off"
            placeholder="abxy"
            maxLength="4"
            value={code}
            onChange={(e) => checkGameType(e.target.value.toLowerCase())}
          />
        </div>

        <div className="col p-0">
          <label htmlFor="nicknameInput" className="form-label">
            Nickname:
          </label>
          <input
            id="nicknameInput"
            className="form-control"
            type="search"
            autoComplete="off"
            spellCheck="false"
            autoCorrect="off"
            placeholder={suggestion.current}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        <input
          disabled={!gameType.valid}
          type="submit"
          className="form-control btn btn-success col-12 mt-3"
          value={
            gameType.valid && props.code && props.code === code
              ? 'Return to Game'
              : 'Join Game'
          }
        />
        <div className={gameType.valid ? 'text-muted' : 'text-danger'}>
          {gameType.title}
        </div>
      </form>
    </div>
  );
};

export default Join;
