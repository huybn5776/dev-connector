import { AxiosResponse } from 'axios';
import { Epic } from 'redux-observable';
import { of, mergeMap } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import { isActionOf, RootAction, RootState, Services } from 'typesafe-actions';

import { postActions } from '@actions';
import HttpException from '@exceptions/http-exception';

type EpicType = Epic<RootAction, RootAction, RootState, Services>;

export const getPosts: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(postActions.getPosts.request)),
    switchMap(() =>
      api.postApi.getPosts().pipe(
        map(postActions.getPosts.success),
        catchError((error: AxiosResponse<HttpException>) => of(postActions.getPosts.failure(error))),
      ),
    ),
  );

export const getPost: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(postActions.getPost.request)),
    switchMap(({ payload }) =>
      api.postApi.getPost(payload).pipe(
        map(postActions.getPost.success),
        catchError((error: AxiosResponse<HttpException>) => of(postActions.getPost.failure(error))),
      ),
    ),
  );

export const likePost: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(postActions.likePost.request)),
    mergeMap(({ payload: postId }) =>
      api.postApi.likePost(postId).pipe(
        map((likes) => postActions.likePost.success({ postId, likes })),
        catchError((error: AxiosResponse<HttpException>) => of(postActions.likePost.failure({ postId, error }))),
      ),
    ),
  );

export const unlikePost: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(postActions.unlikePost.request)),
    mergeMap(({ payload: postId }) =>
      api.postApi.unlikePost(postId).pipe(
        map((likes) => postActions.unlikePost.success({ postId, likes })),
        catchError((error: AxiosResponse<HttpException>) => of(postActions.unlikePost.failure({ postId, error }))),
      ),
    ),
  );

export const likeComment: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(postActions.likeComment.request)),
    mergeMap(({ payload: { postId, commentId } }) =>
      api.postApi.likeComment(commentId).pipe(
        map((likes) => postActions.likeComment.success({ postId, commentId, likes })),
        catchError((error: AxiosResponse<HttpException>) => of(postActions.likeComment.failure({ commentId, error }))),
      ),
    ),
  );

export const unlikeComment: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(postActions.unlikeComment.request)),
    mergeMap(({ payload: { postId, commentId } }) =>
      api.postApi.unlikeComment(commentId).pipe(
        map((likes) => postActions.unlikeComment.success({ postId, commentId, likes })),
        catchError((error: AxiosResponse<HttpException>) =>
          of(postActions.unlikeComment.failure({ commentId, error })),
        ),
      ),
    ),
  );

export const updatePost: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(postActions.updatePost.request)),
    mergeMap(({ payload: { postId, postData } }) =>
      api.postApi.patchPost(postId, postData).pipe(
        map((post) => postActions.updatePost.success(post)),
        catchError((error: AxiosResponse<HttpException>) => of(postActions.updatePost.failure({ postId, error }))),
      ),
    ),
  );

export const updateComment: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(postActions.updateComment.request)),
    mergeMap(({ payload: { postId, commentId, commentData } }) =>
      api.postApi.patchComment(commentId, commentData).pipe(
        map((comment) => postActions.updateComment.success({ postId, comment })),
        catchError((error: AxiosResponse<HttpException>) =>
          of(postActions.updateComment.failure({ commentId, error })),
        ),
      ),
    ),
  );
