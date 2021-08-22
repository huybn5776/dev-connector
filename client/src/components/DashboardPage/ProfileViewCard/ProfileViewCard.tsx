import React from 'react';

import clsx from 'clsx';

import CardLayout, { CardContent, CardHeader, CardTitle, CardHeaderLink } from '@components/CardLayout/CardLayout';
import { ProfileDto } from '@dtos/profile.dto';
import { UserDto } from '@dtos/user.dto';

import styles from './ProfileViewCard.module.scss';

interface Props {
  user: UserDto;
  profile: ProfileDto;
}

const ProfileViewCard: React.FC<Props> = ({ user, profile }: Props) => {
  function renderProfileSocial(name: keyof NonNullable<typeof profile.social>): JSX.Element | null {
    if (!profile.social?.[name]) {
      return null;
    }
    return (
      <p>
        <i className={clsx('icon', name, styles.socialIcon)} />
        <a href={profile.social?.[name]}>{profile.social?.[name]}</a>
      </p>
    );
  }

  return (
    <CardLayout title="Profile">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardHeaderLink to="/edit-profile" iconClassName={clsx('edit', 'outline')}/>
      </CardHeader>

      <CardContent className={styles.profileContent}>
        <h3>
          {user.fullName} - {profile.status}
        </h3>
        {profile.company && <p>at {profile.company}</p>}
        {profile.location && <p className={styles.profileSecondaryContent}>{profile.location}</p>}
        {profile.skills && (
          <div className={styles.skillTagContainer}>
            {profile.skills.map((skill) => {
              return (
                <span className={styles.skillTag} key={skill}>
                  {skill}
                </span>
              );
            })}
          </div>
        )}

        {profile.githubUsername && (
          <p>
            <i className={clsx('icon', 'github', styles.socialIcon)} />
            <a href={`https://github.com/${profile.githubUsername}`}>{profile.githubUsername}</a>
          </p>
        )}
        {profile.website && (
          <p>
            <i className={clsx('icon', 'home', styles.socialIcon)} />
            <a href={profile.website}>{profile.website}</a>
          </p>
        )}
        {renderProfileSocial('youtube')}
        {renderProfileSocial('twitter')}
        {renderProfileSocial('facebook')}
        {renderProfileSocial('linkedin')}
        {renderProfileSocial('instagram')}
      </CardContent>
    </CardLayout>
  );
};

export default ProfileViewCard;
