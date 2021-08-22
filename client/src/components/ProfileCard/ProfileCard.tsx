import React from 'react';

import clsx from 'clsx';
import { Link } from 'react-router-dom';

import CardLayout from '@components/CardLayout/CardLayout';
import { ProfileDto } from '@dtos/profile.dto';

import styles from './ProfileCard.module.scss';
import buttonStyles from '@styles/button.module.scss';

interface Props {
  profile: ProfileDto;
}

const ProfileCard: React.FC<Props> = ({
  profile: {
    user,
    user: { id: userId },
    status,
    company,
    location,
    skills,
  },
}: Props) => {
  return (
    <CardLayout>
      <div className={styles.ProfileCard}>
        <img className={styles.profileAvatarImg} src={user.avatar} alt={user.fullName} />

        <div className={styles.profileSummary}>
          <p className={clsx(styles.profileSummaryText, styles.profileSummaryName)}>{user.fullName}</p>
          <p className={styles.profileSummaryText}>
            {status}
            {company && ` at ${company}`}
          </p>
          <p className={styles.profileSummaryText}>{location}</p>
          <Link
            className={clsx('ui', 'button', buttonStyles.secondaryButton, styles.viewProfileButton)}
            to={`/profiles/${userId}`}
          >
            View profile
          </Link>
        </div>

        <ul className={styles.profileSkills}>
          {skills.map((skill) => (
            <li className={styles.profileSkillTag} key={skill}>
              {skill}
            </li>
          ))}
        </ul>
      </div>
    </CardLayout>
  );
};

export default ProfileCard;
