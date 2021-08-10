import React, { useEffect, useState, useRef } from 'react';

import clsx from 'clsx';
import { connect, useDispatch } from 'react-redux';

import { postActions } from '@actions';
import Loader from '@components/Loader/Loader';
import PostCommentForm from '@components/PostCommentForm/PostCommentForm';
import PostCommentItem from '@components/PostCommentItem/PostCommentItem';
import PostForm from '@components/PostForm/PostForm';
import PostItem from '@components/PostItem/PostItem';
import { PostCommentDto } from '@dtos/post-comment.dto';
import { PostDto } from '@dtos/post.dto';
import { ApplicationState, StateToPropsFunc } from '@store';

import styles from './PostsPage.module.scss';

type PropsFromState = Pick<ApplicationState['auth'], 'user'> &
  Pick<
    ApplicationState['post'],
    | 'posts'
    | 'creatingPost'
    | 'loadedPostsId'
    | 'loadingPostsId'
    | 'updatingPostId'
    | 'updatingCommentId'
    | 'updatingLikePostsId'
    | 'updatingLikeCommentsId'
    | 'addingCommentPostsId'
    | 'loading'
  >;

const PostsPage: React.FC<PropsFromState> = ({
  user,
  posts,
  creatingPost,
  loadedPostsId,
  loadingPostsId,
  updatingPostId,
  updatingCommentId,
  updatingLikePostsId,
  updatingLikeCommentsId,
  addingCommentPostsId,
  loading,
}: PropsFromState) => {
  const dispatch = useDispatch();
  const [commentingPostsId, setCommentingPostsId] = useState<Record<string, true>>({});
  const [postsCommentsExpanded, setPostsCommentsExpanded] = useState<Record<string, boolean>>({});
  const postCommentFormsRef = useRef<Record<string, React.ElementRef<typeof PostCommentForm>>>({});

  useEffect(() => {
    dispatch(postActions.getPosts.request());
  }, [dispatch]);

  function isLiked(postOrComment: PostDto | PostCommentDto): boolean {
    return postOrComment.likes.some((like) => like.user.id === user?.id);
  }

  function focusToCommentInput(postId: string): void {
    setCommentingPostsId({ ...commentingPostsId, [postId]: true });
    postCommentFormsRef.current[postId]?.focusInput?.();
    setPostsCommentsExpanded({ ...postsCommentsExpanded, [postId]: true });
  }

  function setCommentFormRef(postId: string, ref: React.ElementRef<typeof PostCommentForm> | null): void {
    if (ref) {
      postCommentFormsRef.current[postId] = ref;
    } else {
      delete postCommentFormsRef.current[postId];
    }
  }

  function onCommentExpandClick(postId: string, expand: boolean): void {
    setPostsCommentsExpanded({ ...postsCommentsExpanded, [postId]: expand });
  }

  return (
    <div className={clsx('page-layout', styles.PostsPage)}>
      <h1>Posts</h1>

      {user ? (
        <div className={styles.postFormContainer}>
          <PostForm user={user} loading={creatingPost} />
        </div>
      ) : null}

      {loading ? (
        <Loader />
      ) : (
        <div className={styles.postList}>
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
              liked={isLiked(post)}
              likeLoading={updatingLikePostsId[post.id]}
              commentsExpanded={postsCommentsExpanded[post.id]}
              detailMode={loadedPostsId[post.id]}
              editable={user && user.id === post.user?.id}
              loading={loadingPostsId[post.id] || false}
              updating={updatingPostId[post.id]}
              onCommentButtonClick={() => focusToCommentInput(post.id)}
              onExpandCommentClick={(expand) => onCommentExpandClick(post.id, expand)}
            >
              {post.comments.map((comment) => (
                <PostCommentItem
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                  liked={isLiked(comment)}
                  likeLoading={updatingLikeCommentsId[comment.id]}
                  detailMode={loadedPostsId[post.id] || commentingPostsId[post.id]}
                  editable={user && user.id === user?.id}
                  updating={updatingCommentId[comment.id]}
                />
              ))}
              {user &&
              (post.commentsCount === 0 ||
                post.comments.length === 0 ||
                loadedPostsId[post.id] ||
                commentingPostsId[post.id]) ? (
                <PostCommentForm
                  user={user}
                  postId={post.id}
                  loading={addingCommentPostsId[post.id]}
                  autoFocus={commentingPostsId[post.id]}
                  ref={(ref) => setCommentFormRef(post.id, ref)}
                />
              ) : null}
            </PostItem>
          ))}
        </div>
      )}
    </div>
  );
};

const mapStateToProps: StateToPropsFunc<PropsFromState> = ({ auth, post }) => ({
  user: auth.user,
  posts: post.posts,
  creatingPost: post.creatingPost,
  loadedPostsId: post.loadedPostsId,
  loadingPostsId: post.loadingPostsId,
  updatingPostId: post.updatingPostId,
  updatingCommentId: post.updatingCommentId,
  updatingLikePostsId: post.updatingLikePostsId,
  updatingLikeCommentsId: post.updatingLikeCommentsId,
  addingCommentPostsId: post.addingCommentPostsId,
  loading: post.loading,
});

export default connect(mapStateToProps)(PostsPage);
