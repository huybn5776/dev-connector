import React from 'react';

import { format } from 'date-fns';

import { dateFormat } from '@/constants';
import { ProfileEducationDto } from '@dtos/profile-education.dto';

import profileViewStyles from '../profile-view.module.scss';

interface Props {
  educations: ProfileEducationDto[];
}
const ProfileEducationsView: React.FC<Props> = ({ educations }: Props) => {
  function renderEducation(education: ProfileEducationDto): JSX.Element {
    return (
      <div className={profileViewStyles.profileViewRow} key={education.id}>
        <h3>{education.school}</h3>
        <p>
          {format(new Date(education.from), dateFormat)} ~
          {education.current || !education.to ? 'Current' : format(new Date(education.to), dateFormat)}
        </p>
        <p>
          <strong>Degree: </strong>
          {education.degree}
        </p>
        <p>
          <strong>Field of Study: </strong>
          {education.fieldOfStudy}
        </p>
        {education.description && (
          <p>
            <strong>Description: </strong>
            {education.description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={profileViewStyles.profileViewSegment}>
      <h2>Educations</h2>
      {educations.map(renderEducation)}
    </div>
  );
};

export default ProfileEducationsView;
