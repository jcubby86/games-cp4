import axios, { AxiosResponse as AxiosRes } from 'axios';

import { ReqBody, ResBody } from './types';

export type AxiosResponse<Res = never> = AxiosRes<Res, never>;
export { AxiosError } from 'axios';

type NoInfer<T> = T extends infer U ? U : never;

interface AxiosWrapper {
  get: <Res extends ResBody | ResBody[] | never = never>(
    path: string
  ) => Promise<AxiosResponse<Res>>;
  post: <
    Req extends ReqBody | never = never,
    Res extends ResBody | never = never
  >(
    path: string,
    data?: NoInfer<Req>
  ) => Promise<AxiosResponse<Res>>;
  put: <
    Req extends ReqBody | never = never,
    Res extends ResBody | never = never
  >(
    path: string,
    data: NoInfer<Req>
  ) => Promise<AxiosResponse<Res>>;
  delete: <Res extends ResBody | never = never>(
    path: string
  ) => Promise<AxiosResponse<Res>>;
  patch: <
    Req extends ReqBody | never = never,
    Res extends ResBody | never = never
  >(
    path: string,
    data: NoInfer<Req>
  ) => Promise<AxiosResponse<Res>>;
}

const wrapper: AxiosWrapper = {
  get: <Res>(path: string) => {
    return axios.get<Res, AxiosResponse<Res>, never>(path);
  },
  post: <Req, Res>(path: string, data: Req) => {
    return axios.post<Res, AxiosResponse<Res>, Req>(path, data);
  },
  put: <Req, Res>(path: string, data: Req) => {
    return axios.put<Res, AxiosResponse<Res>, Req>(path, data);
  },
  delete: <Res>(path: string) => {
    return axios.delete<Res, AxiosResponse<Res>, never>(path);
  },
  patch: <Req, Res>(path: string, data: Req) => {
    return axios.patch<Res, AxiosResponse<Res>, Req>(path, data);
  }
};

export default wrapper;
