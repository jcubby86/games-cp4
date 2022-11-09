import { useState, useEffect } from 'react';
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
  const [part, setPart] = useState('');

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
      navigate('/');
    }
  };

  const startGame = async (e) => {
    e.preventDefault();
    await axios.put(`/api/games/${props.code}`, { phase: 'play' });
  };

  const sendPart = async (e) => {
    e.preventDefault();
    await axios.put('/api/stories', { part: part });
    setPhase('wait');
    setPart('');
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
      <form onSubmit={startGame}>
        <div>Game Code: {props.code}</div>
        <div>Player Count: {playerCount}</div>
        <input type="submit" value="Start Game" />
      </form>
    );
  } else if (phase === 'play') {
    return (
      <form onSubmit={sendPart}>
        <p>
          {placeholder} {prefix}
        </p>
        <textarea
          placeholder={prompt}
          value={part}
          onChange={(e) => setPart(e.target.value)}
        />
        <p style={{ marginTop: 0 }}>{suffix}</p>
        <input type="submit" value="Send" />
      </form>
    );
  } else if (phase === 'read') {
    return <div>{story}</div>;
  } else {
    // phase === 'wait'
    return <div>waiting...</div>;
  }
};

export default Story;
