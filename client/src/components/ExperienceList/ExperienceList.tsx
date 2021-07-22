import React from 'react';

import clsx from 'clsx';
import { format } from 'date-fns';

import CardLayout, {
  CardHeader,
  CardTitle,
  CardHeaderLink,
  CardHeaderActionIcon,
  CardContent,
  CardRowToolbar,
  CardRow,
} from '@components/CardLayout/CardLayout';
import { ProfileExperience } from '@interfaces/profile-experience';

import styles from './ExperienceList.module.scss';

interface Props {
  experiences: ProfileExperience[];
}

const dateFormat = 'yyyy-MM-dd';
const ExperienceList: React.FC<Props> = ({ experiences }: Props) => {
  function renderExperience(experience: ProfileExperience): JSX.Element {
    return (
      <CardRow key={experience._id}>
        <h3 className={styles.experienceTitle}>{experience.title}</h3>
        <h3 className={styles.experienceCompany}>{experience.company}</h3>
        <p >
          {format(new Date(experience.from), dateFormat)} ~
          {experience.current || !experience.to ? 'Now' : format(new Date(experience.to), dateFormat)}
        </p>
        {experience.location && <p>{experience.location}</p>}
        {experience.description && <p  className={styles.experienceDescription}>{experience.description}</p>}

       <CardRowToolbar>
         <CardHeaderLink to="/edit-experience" iconClassName={clsx('edit', 'outline')} />
         <CardHeaderActionIcon className={clsx('trash', 'alternate')} />
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
