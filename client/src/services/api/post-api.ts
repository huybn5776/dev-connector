import axios from 'axios';
import { Observable } from 'rxjs';

import { PostDto } from '@dtos/post.dto';

import { AxiosProxy } from './api-utils';

const axiosInstance = axios.create({ baseURL: '/api/posts' });
const axiosProxy = new AxiosProxy(axiosInstance);

export function getPosts(): Observable<PostDto[]> {
  return axiosProxy.get('/');
}

export function getPost(id: string): Observable<PostDto> {
  return axiosProxy.get(`/${id}`);
}
