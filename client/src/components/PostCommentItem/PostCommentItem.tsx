import React, { useState, useRef, useEffect } from 'react';

import clsx from 'clsx';
import { format } from 'date-fns';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';

import { dateFormat } from '@/constants';
import { postActions } from '@actions';
import Loader from '@components/Loader/Loader';
import { PostCommentDto } from '@dtos/post-comment.dto';
import { useSingleHotkey } from '@hooks/use-single-hotkey';

import styles from './PostCommentItem.module.scss';

interface Props {
  comment: PostCommentDto;
  postId: string;
  liked: boolean;
  likeLoading: boolean;
  detailMode?: boolean;
  editable?: boolean;
  updating?: boolean;
}

const PostCommentItem: React.FC<Props> = ({
  comment: { id, user, text, author, avatar, likes, updatedAt },
  postId,
  liked,
  likeLoading,
  detailMode,
  editable,
  updating,
}: Props) => {
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const [saveHotkey$, saveHotkeySubscription] = useSingleHotkey((event) => event.key === 'Enter');
  const [cancelHotkey$, cancelHotkeySubscription] = useSingleHotkey((event) => event.key === 'Escape');
  const textarea = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!updating) {
      setEditMode(false);
    }
  }, [updating]);

  function toggleLike(): void {
    if (liked) {
      dispatch(postActions.unlikeComment.request({ postId, commentId: id }));
    } else {
      dispatch(postActions.likeComment.request({ postId, commentId: id }));
    }
  }

  function setTextareaRef(textareaElement: HTMLTextAreaElement | null): void {
    textarea.current = textareaElement;
    if (textarea.current && !textarea.current.value) {
      textarea.current.value = text;
    }
  }

  function enterEditMode(): void {
    setEditMode(true);
    subscribeHotkeys();
  }

  function save(): void {
    const content = textarea.current?.value || text;
    dispatch(postActions.updateComment.request({ postId, commentId: id, commentData: { text: content } }));
    unsubscribeHotkeys();
  }

  function cancelEdit(): void {
    setEditMode(false);
    unsubscribeHotkeys();
  }

  function subscribeHotkeys(): void {
    saveHotkey$.subscribe(() => save());
    cancelHotkey$.subscribe(() => cancelEdit());
  }

  function unsubscribeHotkeys(): void {
    saveHotkeySubscription.current?.unsubscribe();
    cancelHotkeySubscription.current?.unsubscribe();
  }

  function onTextareaKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === 'Enter' && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      save();
    }
  }

  function deleteComment(): void {
    dispatch(postActions.deleteComment.request({ postId, commentId: id }));
  }

  return (
    <div className={styles.PostComment}>
      <Link to={`/profiles/${user?.id}`}>
        <img className={styles.commentAvatar} src={avatar} alt={author} />
      </Link>
      <div className={styles.commentContent}>
        <Link className={styles.commentAuthor} to={`/profiles/${user?.id}`}>
          {author}
        </Link>
        {editMode ? (
          <TextareaAutosize
            className={styles.commentInput}
            autoFocus
            disabled={updating}
            ref={setTextareaRef}
            onKeyDown={onTextareaKeyDown}
          />
        ) : (
          <p className={styles.commentText}>{text}</p>
        )}

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
              <>
                <button className={styles.commentAction} type="button" onClick={enterEditMode}>
                  <span className={styles.commentActionText}>Edit</span>
                </button>
                <button className={styles.commentAction} type="button" onClick={deleteComment}>
                  <span className={styles.commentActionText}>Delete</span>
                </button>
              </>
            )}
            <span className={styles.commentTimestamp}>
              {format(new Date(updatedAt), dateFormat)}{' '}
              {updating ? <Loader className={styles.commentActionLoader} /> : null}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PostCommentItem;
