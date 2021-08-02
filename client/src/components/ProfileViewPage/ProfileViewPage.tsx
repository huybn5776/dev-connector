import React, { useEffect } from 'react';

import clsx from 'clsx';
import { useDispatch, connect } from 'react-redux';
import { Link, useParams } from 'react-router-dom';

import { profileActions } from '@actions';
import Loader from '@components/Loader/Loader';
import ProfileAbout from '@components/ProfileViewPage/ProfileAbout/ProfileAbout';
import ProfileEducationsView from '@components/ProfileViewPage/ProfileEducationsView/ProfileEducationsView';
import ProfileExperiencesView from '@components/ProfileViewPage/ProfileExperiencesView/ProfileExperiencesView';
import ProfileTop from '@components/ProfileViewPage/ProfileTop/ProfileTop';
import { ProfileDto } from '@dtos/profile.dto';
import { UserDto } from '@dtos/user.dto';
import { StateToPropsFunc } from '@store';
import { isNotNilOrEmpty } from '@utils/object-utils';

import styles from './ProfileViewPage.module.scss';
import buttonStyles from '@styles/button.module.scss';

interface PropsFromState {
  profiles?: ProfileDto[];
  loading: boolean;
  currentUser?: UserDto;
}

const ProfileViewPage: React.FC<PropsFromState> = ({ profiles, loading, currentUser }: PropsFromState) => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const profile = profiles?.find((p) => p.user.id === id);

  useEffect(() => {
    dispatch(profileActions.getUserProfile.request(id));
  }, [id, dispatch]);

  function renderProfileView(): JSX.Element | null {
    if (!profile) {
      return null;
    }
    return (
      <div className={styles.profileViewContent}>
        <ProfileTop profile={profile} />
        <ProfileAbout profile={profile} />
        {isNotNilOrEmpty(profile.experiences) && isNotNilOrEmpty(profile.educations) && (
          <div className={styles.profileExperienceAndEducation}>
            {isNotNilOrEmpty(profile.experiences) && <ProfileExperiencesView experiences={profile.experiences} />}
            {isNotNilOrEmpty(profile.educations) && <ProfileEducationsView educations={profile.educations} />}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-layout">
      <Link className={clsx('ui', 'button', buttonStyles.secondaryButton)} to="/profiles">
        Back to Profiles
      </Link>
      {currentUser?.id && currentUser?.id === profile?.user?.id && (
        <Link className={clsx('ui', 'button', buttonStyles.secondaryButton)} to="/edit-profile">
          Edit profile
        </Link>
      )}

      {loading && !profile ? <Loader /> : renderProfileView()}
    </div>
  );
};

const mapStateToProps: StateToPropsFunc<PropsFromState> = ({ profile, auth }) => ({
  profiles: profile.profiles,
  loading: profile.loading,
  currentUser: auth.user,
});

export default connect(mapStateToProps)(ProfileViewPage);
