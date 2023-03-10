import { Outlet, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppState } from '../contexts/AppContext';
import { AppState } from '../contexts/AppContextTypes';

const Layout = (): JSX.Element => {
  const navigate = useNavigate();
  const { appState, setAppState } = useAppState();

  const leaveGame = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      await axios.delete('/api/user');
      setAppState((state: AppState): AppState => {
        return { ...state, gameCode: '', gameType: '' };
      });
      navigate('/');
    } catch (err) {
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
              <form
                onSubmit={leaveGame}
                className="d-flex justify-content-start"
              >
                <button className="btn btn-outline-danger" type="submit">
                  <span className="icon pe-2">
                    <i className="nf-mdi-account_off" />
                  </span>
                  Leave Game
                </button>
              </form>
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
          <span className="icon">
            <i className="nf-cod-github_inverted"></i>
          </span>
        </a>
        <a
          href="https://www.linkedin.com/in/jacob-bastian-643033206/"
          className="text-dark text-decoration-none link-info"
          target="_blank"
          rel="noreferrer"
        >
          <span className="icon">
            <i className="nf-fa-linkedin_square"></i>
          </span>
        </a>
        <a
          href="mailto:games@jmbastian.com?&subject=Hello!&body=I'm reaching out about"
          className="text-dark text-decoration-none link-warning"
          target="_blank"
          rel="noreferrer"
        >
          <span className="icon">
            <i className="nf-mdi-email_variant"></i>
          </span>
        </a>
      </footer>
    </>
  );
};

export default Layout;
