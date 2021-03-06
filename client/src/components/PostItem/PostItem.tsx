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
  commentsExpanded: boolean | undefined;
  editable?: boolean;
  loading?: boolean;
  updating?: boolean;
  onCommentButtonClick?: (event: React.MouseEvent) => void;
  onExpandCommentClick: (expand: boolean) => void;
  onIntersection?: (intersecting: boolean) => void;
  children: JSX.Element | (JSX.Element | JSX.Element[] | null)[] | null;
}

const PostItem: React.FC<Props> = ({
  post: { id, user, text, author, avatar, likes, comments, commentsCount, createdAt, updatedAt },
  liked,
  likeLoading,
  detailMode,
  commentsExpanded,
  editable,
  loading,
  updating,
  onCommentButtonClick,
  onExpandCommentClick,
  onIntersection,
  children,
}: Props) => {
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const textarea = useRef<HTMLTextAreaElement | null>(null);
  const [saveHotkey$, saveHotkeySubscription] = useSingleHotkey((event) => event.metaKey && event.key === 'Enter');
  const [cancelHotkey$, cancelHotkeySubscription] = useSingleHotkey((event) => event.key === 'Escape');

  const intersectionObserver = useRef<IntersectionObserver | undefined>(
    new IntersectionObserver((entries) => onIntersection?.(entries[0].isIntersecting)),
  );
  const elementRef = useRef<HTMLElement | undefined>();

  useEffect(() => {
    if (!updating) {
      setEditMode(false);
    }
  }, [updating]);

  function expandComments(): void {
    if (!detailMode) {
      dispatch(postActions.getPost.request(id));
    }
    onExpandCommentClick(true);
  }

  function collapseComments(): void {
    onExpandCommentClick(false);
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

  function deletePost(): void {
    dispatch(postActions.deletePost.request({ postId: id }));
  }

  function updateObserver(element: HTMLElement | null): void {
    if (element) {
      intersectionObserver.current?.observe(element);
      elementRef.current = element;
    } else if (elementRef.current) {
      intersectionObserver.current?.unobserve(elementRef.current);
    }
  }

  return (
    <div className={styles.PostItem} ref={updateObserver}>
      <div className={styles.postTop}>
        <div className={styles.postInfo}>
          <img className={styles.postAvatar} src={avatar} alt={user?.fullName || author} />
          <Link
            className={styles.postTimestamp}
            to={`/posts/${id}`}
            title={`Update at ${format(new Date(updatedAt), dateFormat)}`}
          >
            {format(new Date(createdAt), dateFormat)}
          </Link>
          <span className={styles.postBy}>&nbsp;by&nbsp;</span>
          <Link className={styles.postAuthor} to={`/profiles/${user?.id}`}>
            {user?.fullName || author}
          </Link>
        </div>

        {updating ? (
          <Loader />
        ) : (
          <RightMenu>
            {editable ? (
              <>
                <MenuItem onClick={enterEditMode}>Edit</MenuItem>
                <MenuItem onClick={deletePost}>Delete</MenuItem>
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
          <button className={styles.postAction} type="button" onClick={onCommentButtonClick}>
            <i className={clsx('icon', 'comment', 'alternate', 'outline')} />
            <span>{commentsCount || comments.length || ''}</span>
          </button>
        </div>
      )}

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
    </div>
  );
};

export default PostItem;
