import { Outlet, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Layout = (props) => {
  const navigate = useNavigate();

  const leaveGame = async (e) => {
    try {
      e.preventDefault();

      await axios.delete('/api/users');
      props.setCode('');
      props.setGameType('');
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
            <Link className="navbar-brand text-light px-3" to=".">
              <i className="fa fa-home px-3"></i>Games
            </Link>

            {props.code && (
              <>
                <form
                  onSubmit={leaveGame}
                  className="d-flex justify-content-start"
                >
                  <button className="btn btn-outline-danger" type="submit">
                    Leave Game
                  </button>
                </form>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex-grow-1 py-5 mb-5">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="footer bg-secondary py-2">
        <div className="container">
          <span className="text-light">
            Jacob Bastian &copy;2022 -{' '}
            <a
              href="https://github.com/jcubby86/games-cp4"
              className="text-light"
              target="_blank"
              rel="noreferrer"
            >
              Github Repository
            </a>
          </span>
        </div>
      </footer>
    </>
  );
};

export default Layout;
