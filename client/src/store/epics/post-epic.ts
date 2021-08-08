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
    mergeMap(({ payload: id }) =>
      api.postApi.likePost(id).pipe(
        map((likes) => postActions.likePost.success({ postId: id, likes })),
        catchError((error: AxiosResponse<HttpException>) => of(postActions.likePost.failure(error))),
      ),
    ),
  );

export const unlikePost: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(postActions.unlikePost.request)),
    mergeMap(({ payload: id }) =>
      api.postApi.unlikePost(id).pipe(
        map((likes) => postActions.unlikePost.success({ postId: id, likes })),
        catchError((error: AxiosResponse<HttpException>) => of(postActions.unlikePost.failure(error))),
      ),
    ),
  );

export const likeComment: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(postActions.likeComment.request)),
    mergeMap(({ payload: { postId, commentId } }) =>
      api.postApi.likeComment(commentId).pipe(
        map((likes) => postActions.likeComment.success({ postId, commentId, likes })),
        catchError((error: AxiosResponse<HttpException>) => of(postActions.likeComment.failure(error))),
      ),
    ),
  );

export const unlikeComment: EpicType = (action$, state$, { api }) =>
  action$.pipe(
    filter(isActionOf(postActions.unlikeComment.request)),
    mergeMap(({ payload: { postId, commentId } }) =>
      api.postApi.unlikeComment(commentId).pipe(
        map((likes) => postActions.unlikeComment.success({ postId, commentId, likes })),
        catchError((error: AxiosResponse<HttpException>) => of(postActions.unlikeComment.failure(error))),
      ),
    ),
  );
