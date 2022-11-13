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
      <form className="row gap-3" onSubmit={joinGame}>
        <div className="col p-0">
          <label htmlFor="nicknameInput" className="form-label">
            Nickname:
          </label>
          <input
            id="nicknameInput"
            className="form-control"
            type="text"
            autoComplete="off"
            spellCheck="false"
            autoCorrect="off"
            placeholder="linux-rules-33"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>

        <div className="col p-0">
          <label htmlFor="codeInput" className="form-label">
            Code:
          </label>
          <input
            id="codeInput"
            className="form-control"
            type="text"
            autoComplete="off"
            spellCheck="false"
            autoCorrect="off"
            placeholder="abxy"
            maxLength="4"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <input
          type="submit"
          className="form-control btn btn-success col-12 mt-4"
          value={
            props.code && props.code === code ? 'Return to Game' : 'Join Game'
          }
        />
      </form>
    </div>
  );
};

export default Join;
