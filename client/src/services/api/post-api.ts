import axios from 'axios';
import { Observable } from 'rxjs';

import { CreatePostCommentDto } from '@dtos/create-post-comment.dto';
import { CreatePostDto } from '@dtos/create-post.dto';
import { PostCommentDto } from '@dtos/post-comment.dto';
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

export function createPost(postData: CreatePostDto): Observable<PostDto> {
  return axiosProxy.post('/', postData);
}

export function patchPost(id: string, postData: CreatePostDto): Observable<PostDto> {
  return axiosProxy.patch(`/${id}`, postData);
}

export function deletePost(id: string): Observable<void> {
  return axiosProxy.delete(`/${id}`);
}

export function patchComment(id: string, commentData: CreatePostCommentDto): Observable<PostCommentDto> {
  return axiosProxy.patch(`/comments/${id}`, commentData);
}

export function deleteComment(postId: string, commentId: string): Observable<PostCommentDto[]> {
  return axiosProxy.delete(`/${postId}/comments/${commentId}`);
}
