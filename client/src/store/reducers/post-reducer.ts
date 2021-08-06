import { AxiosResponse } from 'axios';
import { createReducer } from 'typesafe-actions';

import { upsertEntityWithSameId, updateEntityWithId } from '@/utils/store-utils';
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
    loadedPostId: { ...state.loadedPostId, [post.id]: true },
    errorResponse: undefined,
    loadingPostId: undefined,
  }))
  .handleAction(
    [postActions.likePost.success, postActions.unlikePost.success],
    (state, { payload: { postId, likes } }) => ({
      ...state,
      posts: updateEntityWithId<PostDto>(state.posts, postId, (post) => ({ ...post, likes })),
      loading: false,
      errorResponse: undefined,
    }),
  );

export default postReducer;
