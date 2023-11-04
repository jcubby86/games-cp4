import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout';
import Home from './pages/Home';
import Story from './pages/Story';
import Join from './pages/Join';
import Create from './pages/Create';
import Names from './pages/Names';
import { AppContextProvider } from './contexts/AppContext';
import { NAMES, STORY } from './helpers/constants';
import StoryArchive from './pages/StoryArchive';
import './App.css';
import 'react-tooltip/dist/react-tooltip.css';
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/js/bootstrap.min.js'

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AppContextProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="join" element={<Join />} />
            <Route path="create" element={<Create />} />
            <Route path={STORY} element={<Story />} />
            <Route path={`${STORY}/:id/:user?`} element={<StoryArchive />} />
            <Route path={NAMES} element={<Names />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </AppContextProvider>
    </BrowserRouter>
  );
}

export default App;
