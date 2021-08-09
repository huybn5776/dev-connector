import React, { useEffect, useRef, useState } from 'react';

import clsx from 'clsx';
import { useDispatch } from 'react-redux';
import TextareaAutosize from 'react-textarea-autosize';

import { postActions } from '@actions';
import { UserDto } from '@dtos/user.dto';

import Loader from '../Loader/Loader';
import styles from './PostCommentForm.module.scss';

interface Props {
  user: UserDto;
  postId: string;
  loading: boolean;
  autoFocus?: boolean;
}

const PostCommentForm: React.FC<Props> = (
  { user, postId, loading, autoFocus }: Props,
) => {
  const dispatch = useDispatch();
  const textarea = useRef<HTMLTextAreaElement | null>(null);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (textarea.current) {
      textarea.current.value = '';
      setEntering(false);
    }
  }, [loading]);

  function save(): void {
    dispatch(postActions.addComment.request({ postId, commentData: { text: textarea.current?.value || '' } }));
  }

  function onTextareaKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === 'Enter' && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      save();
    }
    setEntering(!!(event.target as HTMLTextAreaElement).value);
  }

  return (
    <form className={styles.PostCommentForm}>
      <img className={styles.commentFormAvatar} src={user.avatar} alt={user.name} />
      <div className={styles.commentFormInputContainer}>
        <TextareaAutosize
          className={clsx(styles.commentFormInput, entering && styles.entering)}
          placeholder="Write a comment"
          autoFocus={autoFocus}
          disabled={loading}
          ref={textarea}
          onKeyDown={onTextareaKeyDown}
        />
        {entering ? (
          <div className={styles.commentInfoBar}>
            <span className={styles.commentSubmitHint}>Press Enter to submit</span>
            {loading ? <Loader className={styles.commentInputLoader} /> : null}
          </div>
        ) : null}
      </div>
    </form>
  );
};

export default PostCommentForm;
