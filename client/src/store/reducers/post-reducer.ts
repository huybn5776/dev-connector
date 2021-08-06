import { AxiosResponse } from 'axios';
import { createReducer } from 'typesafe-actions';

import { upsertEntityWithSameId } from '@/utils/store-utils';
import { postActions } from '@actions';
import { PostDto } from '@dtos/post.dto';
import HttpException from '@exceptions/http-exception';

export interface PostState {
  posts: PostDto[];
  postsLoaded: boolean;
  loadedPostId: Record<string, true>;
  errorResponse?: AxiosResponse<HttpException>;
  loading: boolean;
  loadingPostId?: string;
}

export const initialState: PostState = {
  posts: [],
  postsLoaded: false,
  loadedPostId: {} as Record<string, true>,
  loading: false,
};

const postReducer = createReducer(initialState)
  .handleAction([postActions.getPosts.request], (state) => ({
    ...state,
    loading: true,
  }))
  .handleAction(postActions.getPost.request, (state, { payload }) => ({
    ...state,
    loadingPostId: payload,
  }))
  .handleAction([postActions.getPosts.failure, postActions.getPost.failure], (state, action) => ({
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
  }))
  .handleAction(postActions.getPost.success, (state, { payload: post }) => ({
    ...state,
    posts: upsertEntityWithSameId(state.posts, post),
    postsLoaded: true,
    loadedPostId: { ...state.loadedPostId, [post.id]: true },
    errorResponse: undefined,
    loadingPostId: undefined,
  }));

export default postReducer;
