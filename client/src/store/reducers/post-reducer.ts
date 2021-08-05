import { AxiosResponse } from 'axios';
import { createReducer } from 'typesafe-actions';

import { postActions } from '@actions';
import { PostDto } from '@dtos/post.dto';
import HttpException from '@exceptions/http-exception';

export interface PostState {
  posts: PostDto[];
  postsLoaded: boolean;
  errorResponse?: AxiosResponse<HttpException>;
  loading: boolean;
}

export const initialState: PostState = {
  posts: [],
  postsLoaded: false,
  loading: false,
};

const postReducer = createReducer(initialState)
  .handleAction([postActions.getPosts.request], (state) => ({
    ...state,
    loading: true,
  }))
  .handleAction([postActions.getPosts.failure], (state, action) => ({
    ...state,
    errorResponse: action.payload,
    loading: false,
  }))
  .handleAction(postActions.getPosts.success, (state, action) => ({
    ...state,
    posts: action.payload,
    postsLoaded: true,
    errorResponse: undefined,
    loading: false,
  }));

export default postReducer;
