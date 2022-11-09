import { Link } from 'react-router-dom';

const Layout = (props) => {
  return (
    <div className="text-center">
      <h1>Welcome</h1>
      {props.gameType && (
        <Link role="button" to={props.gameType} className="btn btn-success m-2">
          Return to Game
        </Link>
      )}
      <Link role="button" to="/join" className="btn btn-primary m-2">
        Join a Game
      </Link>
      <Link role="button" to="/create" className="btn btn-primary m-2">
        Create a Game
      </Link>
    </div>
  );
};

export default Layout;
