import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import generateNickname from '../helpers/nicknameGeneration';

interface CreateProps {
  nickname: string;
  setGameType: React.Dispatch<React.SetStateAction<string>>;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  setNickname: React.Dispatch<React.SetStateAction<string>>;
}
const Create = (props: CreateProps) => {
  const suggestion = useRef(generateNickname());
  const [nickname, setNickname] = useState(props.nickname);
  const [selected, setSelected] = useState('story');
  const navigate = useNavigate();

  const createGame = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selected === '') {
        alert('Please select a valid game type');
        return;
      }

      const gameResponse = await axios.post('/api/game', {
        creator: nickname.toLowerCase(),
        type: selected
      });
      const userResponse = await axios.post('/api/user', {
        nickname: nickname.toLowerCase() || suggestion.current,
        code: gameResponse.data.code
      });
      props.setCode(gameResponse.data.code);
      props.setNickname(userResponse.data.nickname);
      props.setGameType(gameResponse.data.type);
      navigate('/' + gameResponse.data.type);
    } catch (err) {
      alert('Unable to create game. Please try again in a little bit.');
    }
  };

  useEffect(() => {
    setNickname(props.nickname);
  }, [props]);

  return (
    <div className="w-100">
      <form onSubmit={createGame}>
        <div className="mb-3">
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
            maxLength={30}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <div
            className="btn-group d-block text-center m-4"
            role="group"
            aria-label="Game Type"
          >
            <button
              className={
                'btn opacity-75 ' +
                (selected === 'story' ? 'btn-primary' : 'btn-outline-primary')
              }
              onClick={(e) => {
                e.preventDefault();
                setSelected('story');
              }}
            >
              He Said She Said
            </button>
            <button
              className={
                'btn opacity-75 ' +
                (selected === 'names' ? 'btn-primary' : 'btn-outline-primary')
              }
              onClick={(e) => {
                e.preventDefault();
                setSelected('names');
              }}
            >
              Name Game
            </button>
          </div>
        </div>
        <input
          type="submit"
          value="Create Game"
          className="form-control btn btn-success"
        />
      </form>
      {selected === 'story' && (
        <p className="p-3 text-wrap">
          Create a fun story reminiscent of mad libs together!
        </p>
      )}
      {selected === 'names' && (
        <p className="p-3 text-wrap">
          Everyone secretly enters the name of a person (real or fictional) that
          others would know. Players then take turns guessing each other's names
          until only one remains!
        </p>
      )}
    </div>
  );
};

export default Create;
