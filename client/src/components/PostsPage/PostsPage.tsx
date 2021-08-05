import React, { useEffect } from 'react';

import { connect, useDispatch } from 'react-redux';

import { postActions } from '@actions';
import Loader from '@components/Loader/Loader';
import PostItem from '@components/PostItem/PostItem';
import { PostDto } from '@dtos/post.dto';
import { UserDto } from '@dtos/user.dto';
import { StateToPropsFunc } from '@store';

import styles from './PostsPage.module.scss';

interface PropsFromState {
  user?: UserDto;
  posts: PostDto[];
  loading: boolean;
}

const PostsPage: React.FC<PropsFromState> = ({ user, posts, loading }: PropsFromState) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(postActions.getPosts.request());
  }, [dispatch]);

  return (
    <div className='page-layout'>
      {loading ? (
        <Loader />
      ) : (
        <div className={styles.postList}>
          {posts.map((post) => (
            <PostItem
              key={post.id}
              post={post}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const mapStateToProps: StateToPropsFunc<PropsFromState> = ({ auth, post }) => ({
  user: auth.user,
  posts: post.posts,
  loading: post.loading,
});

export default connect(mapStateToProps)(PostsPage);
