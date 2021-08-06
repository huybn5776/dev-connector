import React, { useState } from 'react';

import clsx from 'clsx';
import { format } from 'date-fns';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { dateFormat } from '@/constants';
import { postActions } from '@actions';
import Loader from '@components/Loader/Loader';
import PostCommentItem from '@components/PostCommentItem/PostCommentItem';
import { PostDto } from '@dtos/post.dto';

import styles from './PostItem.module.scss';

interface Props {
  post: PostDto;
  detailMode: boolean;
  loading?: boolean;
}

const PostItem: React.FC<Props> = ({
  post: { id, user, text, name, avatar, likes, comments, commentsCount, createdAt, updatedAt },
  detailMode,
  loading,
}: Props) => {
  const dispatch = useDispatch();
  const [commentsExpanded, setCommentsExpanded] = useState<boolean | undefined>(undefined);

  function expandComments(): void {
    if (!detailMode) {
      dispatch(postActions.getPost.request(id));
    }
    setCommentsExpanded(true);
  }

  function collapseComments(): void {
    setCommentsExpanded(false);
  }

  return (
    <div className={styles.PostItem}>
      <div className={styles.postTop}>
        <div className={styles.postInfo}>
          <img className={styles.postAvatar} src={avatar} alt={name} />
          <span className={styles.postTimestamp} title={`Update at ${format(new Date(updatedAt), dateFormat)}`}>
            {format(new Date(createdAt), dateFormat)}
          </span>
          <span className={styles.postBy}>&nbsp;by&nbsp;</span>
          <Link className={styles.postUsername} to={`/profiles/${user?.id}`}>
            {name}
          </Link>
        </div>
        <i className={clsx('icon', 'ellipsis', 'horizontal')} />
      </div>
      <div className={styles.postContent}>{text}</div>
      <div className={styles.postActions}>
        <button className={styles.postAction} type="button">
          <i className={clsx('icon', 'heart', 'outline')} />
          <span>{likes.length || ''}</span>
        </button>
        <button className={styles.postAction} type="button">
          <i className={clsx('icon', 'comment', 'alternate', 'outline')} />
          <span>{commentsCount || comments.length || ''}</span>
        </button>
      </div>
      {commentsCount || comments.length ? (
        <div className={styles.postComments}>
          <div className={styles.postCommentsHeading}>
            <p className={styles.postCommentsTitle}>Comments</p>
            {loading ? <Loader /> : null}
            {commentsExpanded && !loading ? (
              <button className={styles.postCommentsExpandButton} type="button" onClick={collapseComments}>
                <i className={clsx('icon', 'comment', 'angle', 'up', styles.postCommentsExpandIcon)} />
              </button>
            ) : null}
            {!commentsExpanded && !loading ? (
              <button className={styles.postCommentsExpandButton} type="button" onClick={expandComments}>
                <i className={clsx('icon', 'comment', 'angle', 'down', styles.postCommentsExpandIcon)} />
              </button>
            ) : null}
          </div>
          {commentsExpanded === false
            ? null
            : comments.map((comment) => <PostCommentItem key={comment.id} comment={comment} detailMode={detailMode} />)}
        </div>
      ) : null}
    </div>
  );
};

export default PostItem;
