import { AxiosResponse } from 'axios';
import { createAsyncAction } from 'typesafe-actions';

import { actionNameCreator } from '@/utils/action-utils';
import { CreatePostCommentDto } from '@dtos/create-post-comment.dto';
import { CreatePostDto } from '@dtos/create-post.dto';
import { PaginationResult } from '@dtos/pagination-result';
import { PostCommentDto } from '@dtos/post-comment.dto';
import { PostLikeDto } from '@dtos/post-like.dto';
import { PostDto } from '@dtos/post.dto';
import HttpException from '@exceptions/http-exception';

const stateName = 'Post';
const { asyncActionNames } = actionNameCreator(stateName);

export const getPosts = createAsyncAction(...asyncActionNames('Get posts'))<
  { limit?: number; offset?: number },
  PaginationResult<PostDto>,
  AxiosResponse<HttpException>
>();

export const getPost = createAsyncAction(...asyncActionNames('Get post'))<
  string,
  PostDto,
  AxiosResponse<HttpException>
>();

export const likePost = createAsyncAction(...asyncActionNames('Like post'))<
  string,
  { postId: string; likes: PostLikeDto[] },
  { postId: string; error: AxiosResponse<HttpException> }
>();

export const unlikePost = createAsyncAction(...asyncActionNames('Unlike post'))<
  string,
  { postId: string; likes: PostLikeDto[] },
  { postId: string; error: AxiosResponse<HttpException> }
>();

export const likeComment = createAsyncAction(...asyncActionNames('Like comment'))<
  { postId: string; commentId: string },
  { postId: string; commentId: string; likes: PostLikeDto[] },
  { commentId: string; error: AxiosResponse<HttpException> }
>();

export const unlikeComment = createAsyncAction(...asyncActionNames('Unlike comment'))<
  { postId: string; commentId: string },
  { postId: string; commentId: string; likes: PostLikeDto[] },
  { commentId: string; error: AxiosResponse<HttpException> }
>();

export const createPost = createAsyncAction(...asyncActionNames('Create post'))<
  CreatePostDto,
  PostDto,
  AxiosResponse<HttpException>
>();

export const updatePost = createAsyncAction(...asyncActionNames('Update post'))<
  { postId: string; postData: CreatePostDto },
  PostDto,
  { postId: string; error: AxiosResponse<HttpException> }
>();

export const deletePost = createAsyncAction(...asyncActionNames('Delete post'))<
  { postId: string },
  { postId: string },
  { postId: string; error: AxiosResponse<HttpException> }
>();

export const addComment = createAsyncAction(...asyncActionNames('Add comment'))<
  { postId: string; commentData: CreatePostCommentDto },
  { postId: string; comment: PostCommentDto },
  { postId: string; error: AxiosResponse<HttpException> }
>();

export const updateComment = createAsyncAction(...asyncActionNames('Update comment'))<
  { postId: string; commentId: string; commentData: CreatePostCommentDto },
  { postId: string; comment: PostCommentDto },
  { commentId: string; error: AxiosResponse<HttpException> }
>();

export const deleteComment = createAsyncAction(...asyncActionNames('Delete comment'))<
  { postId: string; commentId: string },
  { postId: string; commentId: string; comments: PostCommentDto[] },
  { commentId: string; error: AxiosResponse<HttpException> }
>();
