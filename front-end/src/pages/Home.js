import { Link } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="text-center">
      <h1>Welcome</h1>
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
