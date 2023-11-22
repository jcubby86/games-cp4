import { useEffect, useRef, useState } from 'react';

import Suggestion from '../components/Suggestion';
import axios from '../utils/axiosWrapper';
import { AdminResBody, LoginReqBody } from '../utils/types';

const Admin = (): JSX.Element => {
  const [state, setState] = useState<AdminResBody | null>(null);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const fetchAdmin = async () => {
    try {
      const response = await axios.get<AdminResBody>('/api/admin');

      setState({
        uuid: response.data.uuid,
        username: response.data.username
      });
    } catch (err: unknown) {
      setState(null);
    }
  };

  const login = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      if (!usernameRef.current || !passwordRef.current) return;

      const response = await axios.post<LoginReqBody, AdminResBody>('/api/admin', {
        username: usernameRef.current.value,
        password: passwordRef.current.value
      });

      setState({
        uuid: response.data.uuid,
        username: response.data.username
      });
    } catch (err: unknown) {
      return;
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  if (state?.uuid) {
    return (
      <Suggestion/>
    );
  } else {
    return (
      <form className='container-fluid' onSubmit={login}>
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
    );
  }
};

export default Admin;
