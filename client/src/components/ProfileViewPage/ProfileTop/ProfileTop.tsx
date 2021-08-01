import React from 'react';

import { isNotNilOrEmpty } from '@core/utils/object-utils';
import clsx from 'clsx';

import { ProfileSocialDto } from '@dtos/profile-social.dto';
import { ProfileDto } from '@dtos/profile.dto';

import styles from './ProfileTop.module.scss';

interface Props {
  profile: ProfileDto;
}

const ProfileTop: React.FC<Props> = ({ profile: { user, status, company, location, social } }: Props) => {
  function renderProfileSocialIcon(name: keyof NonNullable<ProfileSocialDto>): JSX.Element | null {
    if (!social?.[name]) {
      return null;
    }
    return (
      <a className={styles.profileViewSocialLink} href={social[name]}>
        <i className={clsx('icon', name, styles.profileViewSocialIcon)} />
      </a>
    );
  }

  return (
    <div className={styles.ProfileTop}>
      <img className={styles.profileViewAvatar} src={user.avatar} alt={user.name} />
      <h1 className={styles.profileViewName}>{user.name}</h1>
      <p className={clsx(styles.profileViewText, styles.profileViewSummary)}>
        {status}
        {company && ` at ${company}`}
      </p>
      {location && <p className={styles.profileViewText}>{location}</p>}
      {isNotNilOrEmpty(social) && (
        <div className={styles.profileViewSocials}>
          {renderProfileSocialIcon('youtube')}
          {renderProfileSocialIcon('twitter')}
          {renderProfileSocialIcon('facebook')}
          {renderProfileSocialIcon('linkedin')}
          {renderProfileSocialIcon('instagram')}
        </div>
      )}
    </div>
  );
};

export default ProfileTop;
