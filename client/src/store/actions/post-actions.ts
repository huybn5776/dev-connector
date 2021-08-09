import { PostLike } from '@core/entities/post-like';
import { AxiosResponse } from 'axios';
import { createAsyncAction } from 'typesafe-actions';

import { actionNameCreator } from '@/utils/action-utils';
import { CreatePostCommentDto } from '@dtos/create-post-comment.dto';
import { CreatePostDto } from '@dtos/create-post.dto';
import { PostCommentDto } from '@dtos/post-comment.dto';
import { PostDto } from '@dtos/post.dto';
import HttpException from '@exceptions/http-exception';

const stateName = 'Post';
const { asyncActionNames } = actionNameCreator(stateName);

export const getPosts = createAsyncAction(...asyncActionNames('Get posts'))<
  undefined,
  PostDto[],
  AxiosResponse<HttpException>
>();

export const getPost = createAsyncAction(...asyncActionNames('Get post'))<
  string,
  PostDto,
  AxiosResponse<HttpException>
>();

export const likePost = createAsyncAction(...asyncActionNames('Like post'))<
  string,
  { postId: string; likes: PostLike[] },
  { postId: string; error: AxiosResponse<HttpException> }
>();

export const unlikePost = createAsyncAction(...asyncActionNames('Unlike post'))<
  string,
  { postId: string; likes: PostLike[] },
  { postId: string; error: AxiosResponse<HttpException> }
>();

export const likeComment = createAsyncAction(...asyncActionNames('Like comment'))<
  { postId: string; commentId: string },
  { postId: string; commentId: string; likes: PostLike[] },
  { commentId: string; error: AxiosResponse<HttpException> }
>();

export const unlikeComment = createAsyncAction(...asyncActionNames('Unlike comment'))<
  { postId: string; commentId: string },
  { postId: string; commentId: string; likes: PostLike[] },
  { commentId: string; error: AxiosResponse<HttpException> }
>();

export const updatePost = createAsyncAction(...asyncActionNames('Update post'))<
  { postId: string; postData: CreatePostDto },
  PostDto,
  { postId: string; error: AxiosResponse<HttpException> }
>();

export const updateComment = createAsyncAction(...asyncActionNames('Update comment'))<
  { postId: string; commentId: string; commentData: CreatePostCommentDto },
  { postId: string; comment: PostCommentDto },
  { commentId: string; error: AxiosResponse<HttpException> }
>();
