import { Link, Outlet, useNavigate } from 'react-router-dom';

import Icon from '../components/Icon';
import { useAppState } from '../contexts/AppContext';
import { AppState } from '../contexts/AppContextTypes';
import axios from '../utils/axiosWrapper';

const Layout = (): JSX.Element => {
  const navigate = useNavigate();
  const { appState, setAppState } = useAppState();

  const leaveGame = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      await axios.delete('/api/user');
      setAppState((state: AppState): AppState => {
        return { ...state, gameCode: '', gameType: '', gameId: '' };
      });
      navigate('/');
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <>
      <header>
        <nav className="navbar navbar-dark bg-dark">
          <div className="container-fluid">
            <Link className="navbar-brand text-light" to=".">
              <i className="nf-fa-home px-3"></i>Games
            </Link>

            {appState.gameCode && (
              <div className="d-flex justify-content-start">
                <button className="btn btn-outline-danger" onClick={leaveGame}>
                  <Icon icon="nf-mdi-account_off" className="pe-2"></Icon>
                  Leave Game
                </button>
              </div>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-grow-1 my-2">
        <div className="container d-flex p-4" style={{ maxWidth: '30rem' }}>
          <Outlet />
        </div>
      </main>

      <footer className="footer bg-light py-2 px-4 d-flex gap-3">
        <a
          href="https://github.com/jcubby86/games-cp4"
          className="text-dark text-decoration-none link-danger ms-auto"
          target="_blank"
          rel="noreferrer"
        >
          <Icon icon="nf-cod-github_inverted"></Icon>
        </a>
        <a
          href="https://www.linkedin.com/in/jacob-bastian-643033206/"
          className="text-dark text-decoration-none link-info"
          target="_blank"
          rel="noreferrer"
        >
          <Icon icon="nf-fa-linkedin_square"></Icon>
        </a>
        <a
          href="mailto:games@jmbastian.com?&subject=Hello!&body=I'm reaching out about"
          className="text-dark text-decoration-none link-warning"
          target="_blank"
          rel="noreferrer"
        >
          <Icon icon="nf-mdi-email_variant"></Icon>
        </a>
      </footer>
    </>
  );
};

export default Layout;
