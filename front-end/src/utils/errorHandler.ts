import { AxiosError } from 'axios';

const handleError = (message: string, err: unknown): void => {
  if (err instanceof AxiosError) {
    if (message && err.response?.data?.error) {
      alert(message + ': ' + err.response.data.error);
      return;
    } else if (err.response?.data?.error) {
      alert(err.response.data.error);
      return;
    }
  }
  alert(message);
};

export default handleError;
