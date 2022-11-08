import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const Story = () => {
  const [nickname, setNickname] = useState('');
  const [phase, setPhase] = useState('');
  const [code, setCode] = useState('');
  const [playerCount, setPlayerCount] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [redirect, setRedirect] = useState('');
  const [story, setStory] = useState('');
  const [part, setPart] = useState('');

  const pollStatus = async () => {
    try {
      const response = await axios.get('/api/stories');
      setNickname(response.data.nickname || nickname);
      setCode(response.data.code || code);
      setPhase(response.data.phase);
      setPlayerCount(response.data.playerCount || playerCount);
      setPrompt(response.data.prompt);
      setPlaceholder(response.data.placeholder);
      setPrefix(response.data.prefix);
      setSuffix(response.data.suffix);
      setStory(response.data.story);
    } catch (error) {
      setRedirect('/');
    }
  };

  const startGame = async (e) => {
    e.preventDefault();
    await axios.put(`/api/games/${code}`, { phase: 'play' });
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

  if (redirect !== '') return <Navigate to={redirect} />;

  if (phase === 'join') {
    return (
      <form onSubmit={startGame}>
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
