import React, { useState, useRef, useEffect } from 'react';

import clsx from 'clsx';
import { format } from 'date-fns';
import { useDispatch } from 'react-redux';
import TextareaAutosize from 'react-textarea-autosize';

import { dateFormat } from '@/constants';
import { postActions } from '@actions';
import Loader from '@components/Loader/Loader';
import { UserDto } from '@dtos/user.dto';
import { useSingleHotkey } from '@hooks/use-single-hotkey';

import styles from './PostForm.module.scss';
import buttonStyles from '@styles/button.module.scss';

interface Props {
  user: UserDto;
  loading: boolean;
}

const PostForm: React.FC<Props> = ({ user, loading }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const textarea = useRef<HTMLTextAreaElement | null>(null);
  const dispatch = useDispatch();
  const [saveHotkey$, saveHotkeySubscription] = useSingleHotkey((event) => event.metaKey && event.key === 'Enter');

  useEffect(() => {
    if (loading) {
      return;
    }
    setExpanded(false);
    if (textarea.current) {
      textarea.current.value = '';
    }
  }, [loading]);

  function startWritingPost(): void {
    setExpanded(true);
    saveHotkey$.subscribe(() => save());
  }

  function cancelForm(): void {
    setExpanded(false);
    unsubscribeHotkeys();
  }

  function save(): void {
    dispatch(postActions.createPost.request({ text: textarea.current?.value || '' }));
    unsubscribeHotkeys();
  }

  function unsubscribeHotkeys(): void {
    saveHotkeySubscription.current?.unsubscribe();
  }

  return (
    <form className={styles.PostForm}>
      <div className={styles.postFormTop}>
        <div className={styles.postFormInfo}>
          <img className={styles.postFormAvatar} src={user.avatar} alt={user.name} />
          {expanded ? (
            <>
              <span className={styles.postFormTimestamp}>{format(new Date(), dateFormat)}</span>
              <span>&nbsp;by&nbsp;</span>
              <span className={styles.postFormUsername}>{user.name}</span>
            </>
          ) : (
            <button className={styles.writePostHint} type="button" onClick={startWritingPost}>
              Write a post
            </button>
          )}
        </div>
        {loading ? <Loader /> : null}
      </div>

      {expanded ? (
        <>
          <TextareaAutosize className={styles.postFormInput} minRows={5} autoFocus disabled={loading} ref={textarea} />
          <div className={styles.postFormButtons}>
            <button
              className={clsx('ui', 'button', buttonStyles.secondaryButton, styles.postFormButton)}
              type="button"
              onClick={cancelForm}
            >
              Cancel
            </button>
            <button
              className={clsx('ui', 'button', buttonStyles.primaryButton, styles.postFormButton)}
              type="submit"
              onClick={save}
            >
              Save
            </button>
          </div>
        </>
      ) : null}
    </form>
  );
};

export default PostForm;
