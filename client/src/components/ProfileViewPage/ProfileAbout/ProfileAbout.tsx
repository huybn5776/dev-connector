import React from 'react';

import { ProfileDto } from '@dtos/profile.dto';

import styles from './ProfileAbout.module.scss';

interface Props {
  profile: ProfileDto;
}

const ProfileAbout: React.FC<Props> = ({ profile: { bio, skills } }: Props) => {
  return (
    <div className={styles.ProfileAbout}>
      {
        bio && (
          <div className={styles.profileAboutRow}>
            <h2>Bio</h2>
            <p>{bio}</p>
          </div>
        )
      }
      <div className={styles.profileAboutRow}>
        <h2>Skills</h2>
        <div className={styles.profileAboutSkills}>
          {skills.map((skill) => (
            <span className={styles.profileAboutSkill} key={skill}>
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileAbout;
