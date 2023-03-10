import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Story from './pages/Story';
import Join from './pages/Join';
import Create from './pages/Create';
import Names from './pages/Names';
import { AppContextProvider } from './contexts/AppContext';

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AppContextProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="join" element={<Join />} />
            <Route path="create" element={<Create />} />
            <Route path="story" element={<Story />} />
            <Route path="names" element={<Names />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </AppContextProvider>
    </BrowserRouter>
  );
}

export default App;
