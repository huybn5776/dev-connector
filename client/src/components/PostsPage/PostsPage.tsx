import React, { useEffect } from 'react';

import { connect, useDispatch } from 'react-redux';

import { postActions } from '@actions';
import Loader from '@components/Loader/Loader';
import PostCommentItem from '@components/PostCommentItem/PostCommentItem';
import PostItem from '@components/PostItem/PostItem';
import { PostDto } from '@dtos/post.dto';
import { UserDto } from '@dtos/user.dto';
import { StateToPropsFunc } from '@store';

import styles from './PostsPage.module.scss';

interface PropsFromState {
  user?: UserDto;
  posts: PostDto[];
  loadedPostId: Record<string, true>;
  loadingPostId?: string;
  loading: boolean;
}

const PostsPage: React.FC<PropsFromState> = ({ user, posts, loadedPostId, loadingPostId, loading }: PropsFromState) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(postActions.getPosts.request());
  }, [dispatch]);

  function isPostLiked(post: PostDto): boolean {
    return post.likes.some((like) => like.user.id === user?.id);
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
              liked={isPostLiked(post)}
              detailMode={loadedPostId[post.id]}
              loading={loadingPostId === post.id}
            >
              {post.comments.map((comment) => (
                <PostCommentItem
                  key={comment.id}
                  comment={comment}
                  detailMode={loadedPostId[post.id]}
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
  loadedPostId: post.loadedPostId,
  loadingPostId: post.loadingPostId,
  loading: post.loading,
});

export default connect(mapStateToProps)(PostsPage);
