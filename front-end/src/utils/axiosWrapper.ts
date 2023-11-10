import axios, { AxiosResponse } from 'axios';
export { AxiosError } from 'axios';

export interface AxiosWrapper {
  get: <Res = never>(path: string) => Promise<AxiosResponse<Res>>;
  post: <Req = never, Res = never>(
    path: string,
    data?: Req
  ) => Promise<AxiosResponse<Res>>;
  put: <Req = never, Res = never>(
    path: string,
    data: Req
  ) => Promise<AxiosResponse<Res>>;
  delete: <Res = never>(path: string) => Promise<AxiosResponse<Res>>;
}

const wrapper: AxiosWrapper = {
  get: <Res = never>(path: string) => {
    return axios.get<Res, AxiosResponse<Res>, never>(path);
  },
  post: <Req = never, Res = never>(path: string, data: Req) => {
    return axios.post<Res, AxiosResponse<Res>, Req>(path, data);
  },
  put: <Req = never, Res = never>(path: string, data: Req) => {
    return axios.put<Res, AxiosResponse<Res>, Req>(path, data);
  },
  delete: <Res = never>(path: string) => {
    return axios.delete<Res, AxiosResponse<Res>, never>(path);
  }
};

export default wrapper;
