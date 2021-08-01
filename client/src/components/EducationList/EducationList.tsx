import React from 'react';

import clsx from 'clsx';
import { format } from 'date-fns';
import { useDispatch } from 'react-redux';

import { dateFormat } from '@/constants';
import { profileActions } from '@actions';
import CardLayout, {
  CardRow,
  CardRowToolbar,
  CardContent,
  CardHeaderLink,
  CardHeader,
  CardHeaderActionIcon,
  CardTitle,
} from '@components/CardLayout/CardLayout';
import { ProfileEducationDto } from '@dtos/profile-education.dto';

import styles from './EducationList.module.scss';

interface Props {
  educations: ProfileEducationDto[];
}

const EducationList: React.FC<Props> = ({ educations }: Props) => {
  const dispatch = useDispatch();

  function renderEducation(education: ProfileEducationDto): JSX.Element {
    return (
      <CardRow key={education.id}>
        <h3 className={styles.educationTitle}>{education.school}</h3>
        <h3 className={styles.educationCompany}>{education.degree}</h3>
        <h3 className={styles.educationCompany}>{education.fieldOfStudy}</h3>
        <p>
          {format(new Date(education.from), dateFormat)} ~
          {education.current || !education.to ? 'Now' : format(new Date(education.to), dateFormat)}
        </p>
        {education.description && <p className={styles.educationDescription}>{education.description}</p>}

        <CardRowToolbar>
          <CardHeaderLink to={`/edit-education/${education.id}`} iconClassName={clsx('edit', 'outline')} />
          <CardHeaderActionIcon
            className={clsx('trash', 'alternate')}
            onClick={() => dispatch(profileActions.deleteEducation.request(education.id))}
          />
        </CardRowToolbar>
      </CardRow>
    );
  }

  return (
    <CardLayout>
      <CardHeader>
        <CardTitle>Education</CardTitle>
        <CardHeaderLink to="/add-education" iconClassName="plus" />
      </CardHeader>

      <CardContent>{educations.map(renderEducation)}</CardContent>
    </CardLayout>
  );
};

export default EducationList;
