import { AxiosError, CanceledError } from 'axios';

export const logError = (err: unknown): void => {
  if (err instanceof CanceledError) {
    return;
  }
  console.error(err);
};

export const alertError = (message: string, err: unknown): void => {
  if (err instanceof CanceledError) {
    return;
  } else if (err instanceof AxiosError) {
    if (message && err.response?.data?.error) {
      alert(message + ': ' + err.response.data.error);
      return;
    } else {
      alert(message + ': ' + err.code);
      return;
    }
  }
  alert(message);
};
