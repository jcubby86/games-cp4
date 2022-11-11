import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Story = (props) => {
  const [phase, setPhase] = useState('');
  const [playerCount, setPlayerCount] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [story, setStory] = useState('');
  const partRef = useRef();

  const navigate = useNavigate();

  const pollStatus = async () => {
    try {
      const response = await axios.get('/api/stories');
      setPhase(response.data.phase);
      setPlayerCount(response.data.playerCount || playerCount);
      setPrompt(response.data.prompt);
      setPlaceholder(response.data.placeholder);
      setPrefix(response.data.prefix);
      setSuffix(response.data.suffix);
      setStory(response.data.story);
    } catch (error) {
      props.setCode('');
      navigate('/');
    }
  };

  const startGame = async (e) => {
    e.preventDefault();
    await axios.put(`/api/games/${props.code}`, { phase: 'play' });
  };

  const sendPart = async (e) => {
    e.preventDefault();
    await axios.put('/api/stories', { part: partRef.current.value });
    setPhase('wait');
    partRef.current = '';
  };

  useEffect(() => {
    pollStatus();
    const timer = setInterval(() => {
      if (phase === 'join' || phase === 'wait') pollStatus();
    }, 3000);
    // clearing interval
    return () => clearInterval(timer);
  });

  if (phase === 'join') {
    return (
      <div className="w-100">
        <div className="text-center mb-4">
          <h1 className="text-nowrap">He Said She Said</h1>
        </div>
        <form className="row gap-3" onSubmit={startGame}>
          <div className="mb-3 col p-0">
            <label htmlFor="gameCode" className="form-label">
              Game Code:
            </label>
            <input
              className="form-control"
              type="text"
              value={props.code}
              aria-label="game code"
              readOnly
              id="gameCode"
              style={{ 'min-width': '100px' }}
            />
          </div>
          <div className="mb-3 col p-0">
            <label htmlFor="playerCount" className="form-label">
              Player Count:
            </label>
            <input
              className="form-control"
              type="text"
              value={playerCount}
              aria-label="player count"
              readOnly
              id="playerCount"
            />
          </div>
          <input
            type="submit"
            value="Start Game"
            className="form-control btn btn-success mt-4 col-12"
          />
        </form>
      </div>
    );
  } else if (phase === 'play') {
    return (
      <form className="w-100" onSubmit={sendPart}>
        <p className="form-label">
          {placeholder} {prefix}
        </p>
        <textarea
          placeholder={prompt}
          ref={partRef}
          className="form-control"
          rows={3}
        />
        <p className="form-label">{suffix}</p>
        <input
          type="submit"
          value="Send"
          className="form-control btn btn-success mt-3"
        />
      </form>
    );
  } else if (phase === 'read') {
    return <p className="lh-lg fs-5 px-2 w-100">{story}</p>;
  } else {
    // phase === 'wait'
    return <h3 className="text-center w-100">Waiting for other players...</h3>;
  }
};

export default Story;
