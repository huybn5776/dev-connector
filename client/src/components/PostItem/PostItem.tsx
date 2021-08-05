import React from 'react';

import clsx from 'clsx';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

import { dateFormat } from '@/constants';
import PostCommentItem from '@components/PostCommentItem/PostCommentItem';
import { PostDto } from '@dtos/post.dto';

import styles from './PostItem.module.scss';

interface Props {
  post: PostDto;
}

const PostItem: React.FC<Props> = ({
  post: { id, user, text, name, avatar, likes, comments, commentsCount, createdAt, updatedAt },
}: Props) => {
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
        <div className={styles.postAction}>
          <i className={clsx('icon', 'heart', 'outline')} />
          <span>{likes.length || ''}</span>
        </div>
        <div className={styles.postAction}>
          <i className={clsx('icon', 'comment', 'alternate', 'outline')} />
          <span>{commentsCount || ''}</span>
        </div>
      </div>
      {commentsCount ? (
        <div className={styles.postComments}>
          <div className={styles.postCommentsHeading}>
            <p className={styles.postCommentsTitle}>Comments</p>
            <button className={styles.postCommentsExpandButton} type="button">
              <i className={clsx('icon', 'comment', 'angle', 'down', styles.postCommentsExpandIcon)} />
            </button>
          </div>
          {comments.map((comment) => (
            <PostCommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default PostItem;
