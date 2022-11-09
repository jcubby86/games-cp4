import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Story from './pages/Story';
import Join from './pages/Join';
import Create from './pages/Create';

function App() {
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [gameType, setGameType] = useState('');

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/users');
      setNickname(response.data.nickname);
      setCode(response.data.game.code);
      setGameType(response.data.game.type);
    } catch (err) {
      return;
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              nickname={nickname}
              code={code}
              setCode={setCode}
              setGameType={setGameType}
              gameType={gameType}
            />
          }
        >
          <Route index element={<Home gameType={gameType} />} />
          <Route
            path="join"
            element={
              <Join
                nickname={nickname}
                code={code}
                setNickname={setNickname}
                setCode={setCode}
                setGameType={setGameType}
              />
            }
          />
          <Route
            path="create"
            element={
              <Create
                nickname={nickname}
                setNickname={setNickname}
                setCode={setCode}
                setGameType={setGameType}
              />
            }
          />
          <Route path="story" element={<Story code={code} />} />
          <Route path="*" element={<Home gameType={gameType} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

