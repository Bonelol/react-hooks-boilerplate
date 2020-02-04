import { AxiosResponse } from 'axios';

export type PromiseReturn<T> = Promise<AxiosResponse<T>>;
