import { Link } from 'react-router-dom';

import Icon from '../components/Icon';
import { useAppState } from '../contexts/AppContext';

const Home = (): JSX.Element => {
  const { appState } = useAppState();

  return (
    <>
      <div className="row justify-content-center gap-4 w-100 m-0">
        {appState.gameId && (
          <Link
            role="button"
            to={appState.gameType}
            className="btn btn-lg btn-success d-flex flex-column fw-bold px-5 col-12"
          >
            <Icon icon="nf-mdi-account_convert" className="py-1"></Icon>
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
          <Icon icon="nf-mdi-account_check" className="flex-grow-1"></Icon>
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
          <Icon
            icon="nf-mdi-account_multiple_plus"
            className="flex-grow-1"
          ></Icon>
          Create a Game
        </Link>
      </div>
    </>
  );
};

export default Home;
