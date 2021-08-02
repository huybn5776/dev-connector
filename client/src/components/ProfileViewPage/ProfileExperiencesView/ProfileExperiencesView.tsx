import React from 'react';

import { format } from 'date-fns';

import { dateFormat } from '@/constants';
import { ProfileExperienceDto } from '@dtos/profile-experience.dto';

import profileViewStyles from '../profile-view.module.scss';

interface Props {
  experiences: ProfileExperienceDto[];
}

const ProfileExperiencesView: React.FC<Props> = ({ experiences }: Props) => {
  function renderExperience(experience: ProfileExperienceDto): JSX.Element {
    return (
      <div className={profileViewStyles.profileViewRow} key={experience.id}>
        <h3>{experience.company}</h3>
        <p>
          {format(new Date(experience.from), dateFormat)} ~
          {experience.current || !experience.to ? 'Current' : format(new Date(experience.to), dateFormat)}
        </p>
        <p>
          <strong>Position: </strong>
          {experience.title}
        </p>
        {experience.description && (
          <p>
            <strong>Description: </strong>
            {experience.description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={profileViewStyles.profileViewSegment}>
      <h2>Experiences</h2>
      {experiences.map(renderExperience)}
    </div>
  );
};

export default ProfileExperiencesView;
