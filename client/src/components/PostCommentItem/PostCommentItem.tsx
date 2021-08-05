import React from 'react';

import { format } from 'date-fns';
import { Link } from 'react-router-dom';

import { dateFormat } from '@/constants';
import { PostCommentDto } from '@dtos/post-comment.dto';

import styles from './PostCommentItem.module.scss';

interface Props {
  comment: PostCommentDto;
  editable?: boolean;
}

const PostCommentItem: React.FC<Props> = ({ comment: { user, text, name, avatar, updatedAt }, editable }: Props) => {
  return (
    <div className={styles.PostComment}>
      <Link to={`/profiles/${user?.id}`}>
        <img className={styles.commentAvatar} src={avatar} alt={name} />
      </Link>
      <div className={styles.commentContent}>
        <Link className={styles.commentUsername} to={`/profiles/${user?.id}`}>
          {name}
        </Link>
        <p className={styles.commentText}>{text}</p>
        <div className={styles.commentActions}>
          <button className={styles.commentAction} type="button">
            Like
          </button>
          {editable && (
            <button className={styles.commentAction} type="button">
              Edit
            </button>
          )}
          <span className={styles.commentTimestamp}>{format(new Date(updatedAt), dateFormat)}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCommentItem;
