import React from 'react';

import clsx from 'clsx';
import { format } from 'date-fns';
import { useDispatch } from 'react-redux';

import { dateFormat } from '@/constants';
import { profileActions } from '@actions';
import CardLayout, {
  CardHeader,
  CardTitle,
  CardHeaderLink,
  CardHeaderActionIcon,
  CardContent,
  CardRowToolbar,
  CardRow,
} from '@components/CardLayout/CardLayout';
import { ProfileExperienceDto } from '@dtos/profile-experience.dto';

import styles from './ExperienceList.module.scss';

interface Props {
  experiences: ProfileExperienceDto[];
}

const ExperienceList: React.FC<Props> = ({ experiences }: Props) => {
  const dispatch = useDispatch();

  function renderExperience(experience: ProfileExperienceDto): JSX.Element {
    return (
      <CardRow key={experience.id}>
        <h3 className={styles.experienceTitle}>{experience.title}</h3>
        <h3 className={styles.experienceCompany}>{experience.company}</h3>
        <p>
          {format(new Date(experience.from), dateFormat)} ~
          {experience.current || !experience.to ? 'Now' : format(new Date(experience.to), dateFormat)}
        </p>
        {experience.location && <p>{experience.location}</p>}
        {experience.description && <p className={styles.experienceDescription}>{experience.description}</p>}

        <CardRowToolbar>
          <CardHeaderLink to={`/edit-experience/${experience.id}`} iconClassName={clsx('edit', 'outline')} />
          <CardHeaderActionIcon
            className={clsx('trash', 'alternate')}
            onClick={() => dispatch(profileActions.deleteExperience.request(experience.id))}
          />
        </CardRowToolbar>
      </CardRow>
    );
  }

  return (
    <CardLayout>
      <CardHeader>
        <CardTitle>Experiences</CardTitle>
        <CardHeaderLink to="/add-experience" iconClassName="plus" />
      </CardHeader>

      <CardContent>{experiences.map(renderExperience)}</CardContent>
    </CardLayout>
  );
};

export default ExperienceList;
