import React, { useEffect } from 'react';

import { connect, useDispatch } from 'react-redux';

import { postActions } from '@actions';
import Loader from '@components/Loader/Loader';
import PostCommentItem from '@components/PostCommentItem/PostCommentItem';
import PostItem from '@components/PostItem/PostItem';
import { PostCommentDto } from '@dtos/post-comment.dto';
import { PostDto } from '@dtos/post.dto';
import { ApplicationState, StateToPropsFunc } from '@store';

import styles from './PostsPage.module.scss';

type PropsFromState = Pick<ApplicationState['auth'], 'user'> &
  Pick<
    ApplicationState['post'],
    'posts' | 'loadedPostsId' | 'loadingPostsId' | 'updatingLikePostsId' | 'updatingLikeCommentsId' | 'loading'
  >;

const PostsPage: React.FC<PropsFromState> = ({
  user,
  posts,
  loadedPostsId,
  loadingPostsId,
  updatingLikePostsId,
  updatingLikeCommentsId,
  loading,
}: PropsFromState) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(postActions.getPosts.request());
  }, [dispatch]);

  function isLiked(postOrComment: PostDto | PostCommentDto): boolean {
    return postOrComment.likes.some((like) => like.user.id === user?.id);
  }

  return (
    <div className="page-layout">
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
              detailMode={loadedPostsId[post.id]}
              loading={loadingPostsId[post.id] || false}
            >
              {post.comments.map((comment) => (
                <PostCommentItem
                  key={comment.id}
                  comment={comment}
                  postId={post.id}
                  liked={isLiked(comment)}
                  likeLoading={updatingLikeCommentsId[comment.id]}
                  detailMode={loadedPostsId[post.id]}
                  editable={user && user.id === user?.id}
                />
              ))}
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
  loadedPostsId: post.loadedPostsId,
  loadingPostsId: post.loadingPostsId,
  updatingLikePostsId: post.updatingLikePostsId,
  updatingLikeCommentsId: post.updatingLikeCommentsId,
  loading: post.loading,
});

export default connect(mapStateToProps)(PostsPage);
