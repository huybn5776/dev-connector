import { AxiosResponse } from 'axios';
import * as R from 'ramda';
import { createReducer } from 'typesafe-actions';

import { upsertEntityWithSameId, updateEntityWithId } from '@/utils/store-utils';
import { postActions } from '@actions';
import { PostDto } from '@dtos/post.dto';
import HttpException from '@exceptions/http-exception';

export interface PostState {
  posts: PostDto[];
  postsLoaded: boolean;
  loadingPostsId: Record<string, true>;
  loadedPostsId: Record<string, true>;
  updatingLikePostsId: Record<string, true>;
  loading: boolean;
  errorResponse?: AxiosResponse<HttpException>;
}

export const initialState: PostState = {
  posts: [],
  postsLoaded: false,
  loadingPostsId: {} as PostState['loadingPostsId'],
  loadedPostsId: {} as PostState['loadedPostsId'],
  updatingLikePostsId: {} as PostState['updatingLikePostsId'],
  loading: false,
};

const postReducer = createReducer(initialState)
  .handleAction([postActions.getPosts.request], (state) => ({
    ...state,
    loading: true,
  }))
  .handleAction(postActions.getPost.request, (state, { payload: postId }) => ({
    ...state,
    loadingPostsId: { ...state.loadedPostsId, [postId]: true },
  }))
  .handleAction(
    [
      postActions.getPosts.failure,
      postActions.getPost.failure,
      postActions.likePost.failure,
      postActions.unlikePost.failure,
    ],
    (state, action) => ({
      ...state,
      errorResponse: action.payload,
      loading: false,
    }),
  )
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
    loadingPostsId: R.omit([post.id], state.loadedPostsId),
    loadedPostsId: { ...state.loadedPostsId, [post.id]: true },
    errorResponse: undefined,
  }))
  .handleAction([postActions.likePost.request, postActions.unlikePost.request], (state, { payload: postId }) => ({
    ...state,
    updatingLikePostsId: { ...state.updatingLikePostsId, [postId]: true },
    errorResponse: undefined,
  }))
  .handleAction(
    [postActions.likePost.success, postActions.unlikePost.success],
    (state, { payload: { postId, likes } }) => ({
      ...state,
      posts: updateEntityWithId<PostDto>(state.posts, postId, (post) => ({ ...post, likes })),
      updatingLikePostsId: R.omit([postId], state.updatingLikePostsId),
      errorResponse: undefined,
    }),
  );

export default postReducer;
