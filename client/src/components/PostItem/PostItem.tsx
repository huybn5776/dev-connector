import React, { useState, useRef, useEffect } from 'react';

import clsx from 'clsx';
import { format } from 'date-fns';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';

import { dateFormat } from '@/constants';
import { postActions } from '@actions';
import Loader from '@components/Loader/Loader';
import RightMenu, { MenuItem } from '@components/RightMenu/RightMenu';
import { PostDto } from '@dtos/post.dto';
import { useSingleHotkey } from '@hooks/use-single-hotkey';

import styles from './PostItem.module.scss';
import buttonStyles from '@styles/button.module.scss';

interface Props {
  post: PostDto;
  liked: boolean;
  likeLoading?: boolean;
  detailMode: boolean;
  editable?: boolean;
  loading?: boolean;
  updating?: boolean;
  children: JSX.Element[];
}

const PostItem: React.FC<Props> = ({
  post: { id, user, text, name, avatar, likes, comments, commentsCount, createdAt, updatedAt },
  liked,
  likeLoading,
  detailMode,
  editable,
  loading,
  updating,
  children,
}: Props) => {
  const dispatch = useDispatch();
  const [commentsExpanded, setCommentsExpanded] = useState<boolean | undefined>(undefined);
  const [editMode, setEditMode] = useState(false);
  const textarea = useRef<HTMLTextAreaElement | null>(null);
  const [saveHotkey$, saveHotkeySubscription] = useSingleHotkey((event) => event.metaKey && event.key === 'Enter');
  const [cancelHotkey$, cancelHotkeySubscription] = useSingleHotkey((event) => event.key === 'Escape');

  useEffect(() => {
    if (!updating) {
      setEditMode(false);
    }
  }, [updating]);

  function expandComments(): void {
    if (!detailMode) {
      dispatch(postActions.getPost.request(id));
    }
    setCommentsExpanded(true);
  }

  function collapseComments(): void {
    setCommentsExpanded(false);
  }

  function toggleLike(): void {
    if (liked) {
      dispatch(postActions.unlikePost.request(id));
    } else {
      dispatch(postActions.likePost.request(id));
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
    dispatch(postActions.updatePost.request({ postId: id, postData: { text: content } }));
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

        {updating ? (
          <Loader />
        ) : (
          <RightMenu>
            {editable ? (
              <>
                <MenuItem onClick={enterEditMode}>Edit</MenuItem>
              </>
            ) : null}
          </RightMenu>
        )}
      </div>

      {editMode ? (
        <>
          <TextareaAutosize
            className={styles.postInput}
            minRows={5}
            autoFocus
            disabled={updating}
            ref={setTextareaRef}
          />
          <div className={styles.postEditButtons}>
            <button
              className={clsx('ui', 'button', buttonStyles.secondaryButton, styles.postEditButton)}
              type="button"
              onClick={cancelEdit}
            >
              Cancel
            </button>
            <button
              className={clsx('ui', 'button', buttonStyles.primaryButton, styles.postEditButton)}
              type="button"
              onClick={save}
            >
              Save
            </button>
          </div>
        </>
      ) : (
        <div className={styles.postContent}>{text}</div>
      )}

      {editMode ? null : (
        <div className={styles.postActions}>
          <button className={styles.postAction} type="button" onClick={toggleLike}>
            {likeLoading ? (
              <Loader className={styles.postActionLoader} />
            ) : (
              <i className={clsx('icon', 'heart', liked ? '' : 'outline', styles.postActionIcon)} />
            )}
            <span>{likes.length || ''}</span>
          </button>
          <button className={styles.postAction} type="button">
            <i className={clsx('icon', 'comment', 'alternate', 'outline')} />
            <span>{commentsCount || comments.length || ''}</span>
          </button>
        </div>
      )}

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
          {commentsExpanded === false ? null : children}
        </div>
      ) : null}
    </div>
  );
};

export default PostItem;
