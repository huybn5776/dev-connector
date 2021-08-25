import { AxiosResponse } from 'axios';
import * as R from 'ramda';
import { createReducer } from 'typesafe-actions';

import { upsertEntityWithSameId, updateEntityWithId, upsertEntitiesWithSameId } from '@/utils/store-utils';
import { postActions } from '@actions';
import { PaginationResult } from '@dtos/pagination-result';
import { PostCommentDto } from '@dtos/post-comment.dto';
import { PostDto } from '@dtos/post.dto';
import HttpException from '@exceptions/http-exception';

export interface PostState {
  posts: PostDto[];
  postsLoaded: boolean;
  total: number;
  offset: number;
  creatingPost: boolean;
  loadingPostsId: Record<string, true>;
  loadedPostsId: Record<string, true>;
  updatingPostId: Record<string, true>;
  updatingCommentId: Record<string, true>;
  updatingLikePostsId: Record<string, true>;
  updatingLikeCommentsId: Record<string, true>;
  addingCommentPostsId: Record<string, true>;
  loading: boolean;
  errorResponse?: AxiosResponse<HttpException>;
}

export const initialState: PostState = {
  posts: [],
  postsLoaded: false,
  total: 0,
  offset: 0,
  creatingPost: false,
  loadingPostsId: {} as PostState['loadingPostsId'],
  loadedPostsId: {} as PostState['loadedPostsId'],
  updatingPostId: {} as PostState['updatingPostId'],
  updatingCommentId: {} as PostState['updatingCommentId'],
  updatingLikePostsId: {} as PostState['updatingLikePostsId'],
  updatingLikeCommentsId: {} as PostState['updatingLikeCommentsId'],
  addingCommentPostsId: {} as PostState['addingCommentPostsId'],
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
  .handleAction([postActions.getPosts.failure, postActions.getPost.failure], (state, action) => ({
    ...state,
    errorResponse: action.payload,
    loading: false,
  }))
  .handleAction(postActions.getPosts.success, (state, { payload }: { payload: PaginationResult<PostDto> }) => {
    const posts = upsertEntitiesWithSameId(state.posts, payload.items, (entity, fetchedEntity) => ({
      ...entity,
      text: fetchedEntity.text,
      updateAt: fetchedEntity.updatedAt,
    }));
    return {
      ...state,
      posts,
      postsLoaded: true,
      total: payload.total,
      offset: payload.offset || 0,
      loadedPostsId: {},
      errorResponse: undefined,
      loading: false,
    };
  })
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
  )
  .handleAction(
    [postActions.likePost.failure, postActions.unlikePost.failure],
    (state, { payload: { postId, error } }) => ({
      ...state,
      updatingLikePostsId: R.omit([postId], state.updatingLikePostsId),
      errorResponse: error,
    }),
  )
  .handleAction(
    [postActions.likeComment.request, postActions.unlikeComment.request],
    (state, { payload: { commentId } }) => ({
      ...state,
      updatingLikeCommentsId: { ...state.updatingLikeCommentsId, [commentId]: true },
      errorResponse: undefined,
    }),
  )
  .handleAction(
    [postActions.likeComment.failure, postActions.unlikeComment.failure],
    (state, { payload: { commentId, error } }) => ({
      ...state,
      updatingLikeCommentsId: R.omit([commentId], state.updatingLikePostsId),
      errorResponse: error,
    }),
  )
  .handleAction(
    [postActions.likeComment.success, postActions.unlikeComment.success],
    (state, { payload: { commentId, postId, likes } }) => ({
      ...state,
      posts: updateEntityWithId<PostDto>(state.posts, postId, (post) => ({
        ...post,
        comments: updateEntityWithId<PostCommentDto>(post.comments, commentId, (comment) => ({ ...comment, likes })),
      })),
      updatingLikeCommentsId: R.omit([commentId], state.updatingLikeCommentsId),
      errorResponse: undefined,
    }),
  )
  .handleAction(postActions.createPost.request, (state) => ({
    ...state,
    creatingPost: true,
    errorResponse: undefined,
  }))
  .handleAction(postActions.createPost.success, (state, { payload: post }) => ({
    ...state,
    posts: [post, ...state.posts],
    creatingPost: false,
  }))
  .handleAction(postActions.createPost.failure, (state, { payload: error }) => ({
    ...state,
    creatingPost: false,
    errorResponse: error,
  }))
  .handleAction([postActions.updatePost.request, postActions.deletePost.request], (state, { payload: { postId } }) => ({
    ...state,
    updatingPostId: { ...state.updatingPostId, [postId]: true },
    errorResponse: undefined,
  }))
  .handleAction(postActions.updatePost.success, (state, { payload: post }) => ({
    ...state,
    posts: upsertEntityWithSameId<PostDto>(state.posts, post),
    updatingPostId: R.omit([post.id], state.updatingPostId),
  }))
  .handleAction(postActions.deletePost.success, (state, { payload: { postId } }) => ({
    ...state,
    posts: state.posts.filter((post) => post.id !== postId),
    updatingPostId: R.omit([postId], state.updatingPostId),
  }))
  .handleAction(
    [postActions.updatePost.failure, postActions.deletePost.failure],
    (state, { payload: { postId, error } }) => ({
      ...state,
      updatingPostId: R.omit([postId], state.updatingPostId),
      errorResponse: error,
    }),
  )
  .handleAction(postActions.addComment.request, (state, { payload: { postId } }) => ({
    ...state,
    addingCommentPostsId: { ...state.addingCommentPostsId, [postId]: true },
    errorResponse: undefined,
  }))
  .handleAction(postActions.addComment.success, (state, { payload: { postId, comment } }) => ({
    ...state,
    posts: updateEntityWithId<PostDto>(state.posts, postId, (post) => ({
      ...post,
      comments: [...post.comments, comment],
    })),
    addingCommentPostsId: R.omit([postId], state.addingCommentPostsId),
  }))
  .handleAction(postActions.addComment.failure, (state, { payload: { postId, error } }) => ({
    ...state,
    addingCommentPostsId: R.omit([postId], state.addingCommentPostsId),
    errorResponse: error,
  }))
  .handleAction(
    [postActions.updateComment.request, postActions.deleteComment.request],
    (state, { payload: { commentId } }) => ({
      ...state,
      updatingCommentId: { ...state.updatingCommentId, [commentId]: true },
      errorResponse: undefined,
    }),
  )
  .handleAction(postActions.updateComment.success, (state, { payload: { postId, comment } }) => ({
    ...state,
    posts: updateEntityWithId<PostDto>(state.posts, postId, (post) => ({
      ...post,
      comments: upsertEntityWithSameId<PostCommentDto>(post.comments, comment),
    })),
    updatingCommentId: R.omit([comment.id], state.updatingCommentId),
  }))
  .handleAction(postActions.deleteComment.success, (state, { payload: { postId, commentId, comments } }) => ({
    ...state,
    posts: updateEntityWithId<PostDto>(state.posts, postId, (post) => ({ ...post, comments })),
    updatingCommentId: R.omit([commentId], state.updatingCommentId),
  }))
  .handleAction(
    [postActions.updateComment.failure, postActions.deleteComment.failure],
    (state, { payload: { commentId, error } }) => ({
      ...state,
      updatingCommentId: R.omit([commentId], state.updatingCommentId),
      errorResponse: error,
    }),
  );

export default postReducer;
