import axios from 'axios';
import { Observable } from 'rxjs';

import { PostLikeDto } from '@dtos/post-like.dto';
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

export function likePost(id: string): Observable<PostLikeDto[]> {
  return axiosProxy.post(`/${id}/likes`);
}

export function unlikePost(id: string): Observable<PostLikeDto[]> {
  return axiosProxy.delete(`/${id}/likes`);
}

export function likeComment(id: string): Observable<PostLikeDto[]> {
  return axiosProxy.post(`/comments/${id}/likes`);
}

export function unlikeComment(id: string): Observable<PostLikeDto[]> {
  return axiosProxy.delete(`/comments/${id}/likes`);
}
