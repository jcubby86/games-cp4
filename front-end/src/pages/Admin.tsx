import { useEffect, useRef, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

import Suggestion from '../components/Suggestion';
import axios from '../utils/axiosWrapper';
import { logError } from '../utils/errorHandler';
import { LoginReqBody, UserResBody } from '../utils/types';

const Admin = (): JSX.Element => {
  const [state, setState] = useState<UserResBody | null>(null);
  const [showToast, setShowToast] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const login = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!usernameRef.current || !passwordRef.current) return;

      const response = await axios.post<LoginReqBody, UserResBody>(
        '/api/user',
        {
          username: usernameRef.current.value,
          password: passwordRef.current.value
        }
      );

      setState({ ...response.data });
    } catch (err: unknown) {
      logError(err);
      setShowToast(true);
      return;
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUser() {
      try {
        const response = await axios.get<UserResBody>('/api/user', controller);
        setState({ ...response.data });
      } catch (err: unknown) {
        logError(err);
      }
    }

    fetchUser();

    return () => controller.abort();
  }, []);

  if (state?.uuid) {
    return <Suggestion />;
  } else {
    return (
      <>
        <form className="container-fluid" onSubmit={login}>
          <div className="mb-3">
            <label htmlFor="usernameInput" className="form-label">
              Admin Username
            </label>
            <input
              type="text"
              className="form-control"
              id="usernameInput"
              ref={usernameRef}
              spellCheck="false"
              autoCorrect="off"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="passwordInput" className="form-label">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="passwordInput"
              ref={passwordRef}
              spellCheck="false"
              autoCorrect="off"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>

        <ToastContainer position="bottom-center" className="p-5">
          <Toast
            onClose={() => setShowToast(false)}
            show={showToast}
            delay={3000}
            autohide
            bg="danger"
          >
            <Toast.Body className="text-light">Invalid Login</Toast.Body>
          </Toast>
        </ToastContainer>
      </>
    );
  }
};

export default Admin;
