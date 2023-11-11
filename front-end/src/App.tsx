import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppContextProvider } from './contexts/AppContext';
import Create from './pages/Create';
import Home from './pages/Home';
import Join from './pages/Join';
import Layout from './pages/Layout';
import Names from './pages/Names';
import Story from './pages/Story';
import StoryArchive from './pages/StoryArchive';
import { NAMES, STORY } from './utils/constants';
import './App.scss';
import 'react-tooltip/dist/react-tooltip.css';

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <AppContextProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="join" element={<Join />} />
            <Route path="create" element={<Create />} />
            <Route path={STORY.toLowerCase()} element={<Story />} />
            <Route
              path={`${STORY.toLowerCase()}/:gameId/:userId?`}
              element={<StoryArchive />}
            />
            <Route path={NAMES.toLowerCase()} element={<Names />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </AppContextProvider>
    </BrowserRouter>
  );
}

export default App;
