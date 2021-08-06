import { AxiosResponse } from 'axios';
import { createAsyncAction } from 'typesafe-actions';

import { actionNameCreator } from '@/utils/action-utils';
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
