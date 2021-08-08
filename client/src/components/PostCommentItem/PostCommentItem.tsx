import React from 'react';

import clsx from 'clsx';
import { format } from 'date-fns';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import { dateFormat } from '@/constants';
import { postActions } from '@actions';
import Loader from '@components/Loader/Loader';
import { PostCommentDto } from '@dtos/post-comment.dto';

import styles from './PostCommentItem.module.scss';

interface Props {
  comment: PostCommentDto;
  postId: string;
  liked: boolean;
  likeLoading: boolean;
  detailMode?: boolean;
  editable?: boolean;
}

const PostCommentItem: React.FC<Props> = ({
  comment: { id, user, text, name, avatar, likes, updatedAt },
  postId,
  liked,
  likeLoading,
  detailMode,
  editable,
}: Props) => {
  const dispatch = useDispatch();

  function toggleLike(): void {
    if (liked) {
      dispatch(postActions.unlikeComment.request({ postId, commentId: id }));
    } else {
      dispatch(postActions.likeComment.request({ postId, commentId: id }));
    }
  }

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
        {detailMode ? (
          <div className={styles.commentActions}>
            <button className={styles.commentAction} type="button" onClick={toggleLike}>
              <span className={clsx(styles.commentActionText, liked ? styles.liked : '')}>
                {liked ? 'Liked' : 'Like'}
              </span>
              {likeLoading ? (
                <Loader className={styles.commentActionLoader} />
              ) : (
                <span className={styles.commentLikesCount}>{likes.length ? likes.length : ''}</span>
              )}
            </button>
            {editable && (
              <button className={styles.commentAction} type="button">
                <span className={styles.commentActionText}>Edit</span>
              </button>
            )}
            <span className={styles.commentTimestamp}>{format(new Date(updatedAt), dateFormat)}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PostCommentItem;
