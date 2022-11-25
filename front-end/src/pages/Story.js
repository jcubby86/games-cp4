import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
import StartGame from '../components/StartGame';
import List from '../components/List';
import axios from 'axios';

const Story = (props) => {
  const [phase, setPhase] = useState('');
  const [users, setUsers] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [story, setStory] = useState('');
  const [filler, setFiller] = useState('');
  const partRef = useRef();

  // const navigate = useNavigate();

  const pollStatus = async () => {
    try {
      const response = await axios.get('/api/stories');
      setPhase(response.data.phase);
      setUsers(response.data.users);
      setPrompt(response.data.prompt);
      setPlaceholder((old) => old || response.data.placeholder);
      setPrefix(response.data.prefix);
      setSuffix(response.data.suffix);
      setFiller(response.data.filler);
      setStory(response.data.story);
    } catch (error) {
      alert('An error has occurred');
      // props.setCode('');
      // navigate('/');
    }
  };

  const sendPart = async (e) => {
    try {
      e.preventDefault();
      if (!partRef.current.value) {
        if (
          !window.confirm(
            "You haven't typed anything in! Do you want to use the placeholder text?"
          )
        )
          return;
      }

      await axios.put('/api/stories', {
        part: partRef.current.value || placeholder,
      });
      setPhase('');
      setPlaceholder('');
      partRef.current.value = '';
    } catch (error) {
      alert('An error has occurred');
      // props.setCode('');
      // navigate('/');
    }
  };

  useEffect(() => {
    if (!phase) pollStatus();
    const timer = setInterval(() => {
      if (phase === 'join' || phase === 'wait') pollStatus();
    }, 3000);

    return () => clearInterval(timer);
  });

  if (phase === 'join') {
    return (
      <StartGame
        code={props.code}
        users={users}
        title={'He Said She Said'}
        setPhase={setPhase}
      ></StartGame>
    );
  } else if (phase === 'play') {
    return (
      <form className="w-100" onSubmit={sendPart}>
        <h3 className="text-center w-100">{prompt}</h3>
        <p className="form-label">
          {filler} {prefix}
        </p>
        <textarea
          placeholder={placeholder}
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
    return (
      <div className="w-100">
        <h3 className="text-center w-100">Waiting for other players...</h3>
        {phase === 'wait' && <List items={users}></List>}
      </div>
    );
  }
};

export default Story;
