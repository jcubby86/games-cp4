import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import StartGame from '../components/StartGame';
import axios from 'axios';

const Story = (props) => {
  const [phase, setPhase] = useState('');
  const [users, setUsers] = useState([]);
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
      setUsers(response.data.users);
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

  const sendPart = async (e) => {
    e.preventDefault();
    await axios.put('/api/stories', { part: partRef.current.value });
    setPhase('wait');
    partRef.current = '';
  };

  useEffect(() => {
    pollStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (phase === 'join' || phase === 'wait') pollStatus();
    }, 3000);
    // clearing interval
    return () => clearInterval(timer);
  });

  if (phase === 'join') {
    return (
      <StartGame
        code={props.code}
        users={users}
        title={'He Said She Said'}
      ></StartGame>
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
