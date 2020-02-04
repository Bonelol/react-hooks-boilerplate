import axios from 'axios';

import { apiHost } from '@config/index';
import { Todo } from '@store/todo/types';
import { PromiseReturn } from './types';

export const getAll = async (): PromiseReturn<Todo[]> =>
  axios({
    url: `${apiHost}/todo`,
    method: 'get'
  });

export const modify = async (data: Todo): PromiseReturn<Todo> =>
  axios({
    url: `${apiHost}/todo/${data.id}`,
    method: 'PUT',
    data
  });
