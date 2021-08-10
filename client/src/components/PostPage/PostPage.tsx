import React, { useEffect, useState, useRef } from 'react';

import clsx from 'clsx';
import { connect, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

import { postActions } from '@actions';
import Loader from '@components/Loader/Loader';
import PostCommentForm from '@components/PostCommentForm/PostCommentForm';
import PostCommentItem from '@components/PostCommentItem/PostCommentItem';
import PostItem from '@components/PostItem/PostItem';
import { PostCommentDto } from '@dtos/post-comment.dto';
import { PostDto } from '@dtos/post.dto';
import { ApplicationState, StateToPropsFunc } from '@store';

import styles from './PostPage.module.scss';

type PropsFromState = Pick<ApplicationState['auth'], 'user'> &
  Pick<
    ApplicationState['post'],
    | 'posts'
    | 'loadingPostsId'
    | 'updatingPostId'
    | 'updatingCommentId'
    | 'updatingLikePostsId'
    | 'updatingLikeCommentsId'
    | 'addingCommentPostsId'
    | 'loading'
  >;

const PostPage: React.FC<PropsFromState> = ({
  user,
  posts,
  loadingPostsId,
  updatingPostId,
  updatingCommentId,
  updatingLikePostsId,
  updatingLikeCommentsId,
  addingCommentPostsId,
}: PropsFromState) => {
  const dispatch = useDispatch();
  const [commentsExpanded, setCommentsExpanded] = useState<boolean>(true);
  const { id: postId } = useParams<{ id: string }>();
  const post = posts.find((p) => p.id === postId);
  const postCommentFormsRef = useRef<React.ElementRef<typeof PostCommentForm> | null>(null);

  useEffect(() => {
    dispatch(postActions.getPost.request(postId));
  }, [postId, dispatch]);

  const loading = loadingPostsId[postId];

  function isLiked(postOrComment: PostDto | PostCommentDto): boolean {
    return postOrComment.likes.some((like) => like.user.id === user?.id);
  }

  function focusToCommentInput(): void {
    postCommentFormsRef.current?.focusInput?.();
    setCommentsExpanded(true);
  }

  function onCommentExpandClick(expand: boolean): void {
    setCommentsExpanded(expand);
  }

  return (
    <div className={clsx('page-layout', styles.PostPage)}>
      {loading || !post ? (
        <Loader />
      ) : (
        <div className={styles.postList}>
          <PostItem
            key={post.id}
            post={post}
            liked={isLiked(post)}
            likeLoading={updatingLikePostsId[post.id]}
            commentsExpanded={commentsExpanded}
            detailMode
            editable={user && user.id === post.user?.id}
            loading={loadingPostsId[post.id] || false}
            updating={updatingPostId[post.id]}
            onCommentButtonClick={() => focusToCommentInput()}
            onExpandCommentClick={(expand) => onCommentExpandClick(expand)}
          >
            {post.comments.map((comment) => (
              <PostCommentItem
                key={comment.id}
                comment={comment}
                postId={post.id}
                liked={isLiked(comment)}
                likeLoading={updatingLikeCommentsId[comment.id]}
                detailMode
                editable={user && user.id === user?.id}
                updating={updatingCommentId[comment.id]}
              />
            ))}
            {user ? (
              <PostCommentForm
                user={user}
                postId={post.id}
                loading={addingCommentPostsId[post.id]}
                ref={postCommentFormsRef}
              />
            ) : null}
          </PostItem>
        </div>
      )}
    </div>
  );
};

const mapStateToProps: StateToPropsFunc<PropsFromState> = ({ auth, post }) => ({
  user: auth.user,
  posts: post.posts,
  loadingPostsId: post.loadingPostsId,
  updatingPostId: post.updatingPostId,
  updatingCommentId: post.updatingCommentId,
  updatingLikePostsId: post.updatingLikePostsId,
  updatingLikeCommentsId: post.updatingLikeCommentsId,
  addingCommentPostsId: post.addingCommentPostsId,
  loading: post.loading,
});

export default connect(mapStateToProps)(PostPage);
