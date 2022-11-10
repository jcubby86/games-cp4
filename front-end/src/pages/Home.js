import { Link } from 'react-router-dom';

const Layout = (props) => {
  return (
    <div className="text-center">
      <h1 className="text-decoration-underline mb-3">Welcome</h1>
      {props.code && (
        <Link role="button" to={props.gameType} className="btn btn-success m-2">
          Return to Game
        </Link>
      )}
      <div>
        <Link
          role="button"
          to="/join"
          className={
            'btn m-2 ' + (props.code ? 'btn-secondary' : 'btn-primary')
          }
        >
          Join a Game
        </Link>
        <Link
          role="button"
          to="/create"
          className={
            'btn m-2 ' + (props.code ? 'btn-secondary' : 'btn-primary')
          }
        >
          Create a Game
        </Link>
      </div>
    </div>
  );
};

export default Layout;
