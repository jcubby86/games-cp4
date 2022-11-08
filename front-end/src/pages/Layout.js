import { Outlet, Link } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <header>
        <nav className="navbar navbar-dark bg-dark">
          <Link className="navbar-brand text-light px-3" to=".">
            <i className="fa fa-home px-3"></i>Games
          </Link>
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
