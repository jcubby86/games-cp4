import { Link } from 'react-router-dom';
import { useAppState } from '../contexts/AppContext';

const Home = (): JSX.Element => {
  const { appState } = useAppState();

  return (
    <>
      <div className="row justify-content-center gap-4 w-100 m-0">
        {appState.gameCode && (
          <Link
            role="button"
            to={appState.gameType}
            className="btn btn-lg btn-success d-flex flex-column fw-bold px-5 col-12"
          >
            <span className="icon py-1">
              <i className="nf-mdi-account_convert" />
            </span>
            Return to Game
          </Link>
        )}
        <Link
          role="button"
          to="/join"
          className={
            'btn btn-lg d-flex flex-column fw-bold col ' +
            (appState.gameCode ? 'btn-outline-success' : 'btn-success')
          }
        >
          <span className="icon flex-grow-1">
            <i className="nf-mdi-account_check" />{' '}
          </span>
          Join a Game
        </Link>
        <Link
          role="button"
          to="/create"
          className={
            'btn btn-lg d-flex flex-column fw-bold col ' +
            (appState.gameCode ? 'btn-outline-success' : 'btn-success')
          }
        >
          <span className="icon flex-grow-1">
            <i className="nf-mdi-account_multiple_plus" />
          </span>
          Create a Game
        </Link>
      </div>
    </>
  );
};

export default Home;
