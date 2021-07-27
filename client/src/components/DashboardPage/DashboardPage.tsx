import React, { useEffect, useState } from 'react';

import { useDispatch, connect } from 'react-redux';

import { profileActions } from '@actions';
import ProfileView from '@components/DashboardPage/ProfileView/ProfileView';
import ExperienceList from '@components/ExperienceList/ExperienceList';
import Loader from '@components/Loader/Loader';
import { ProfileDto } from '@dtos/profile.dto';
import { UserDto } from '@dtos/user.dto';
import { HttpException } from '@exceptions';
import { StateToPropsFunc } from '@store';

import styles from './DashboardPage.module.scss';

interface PropsFromState {
  user?: UserDto;
  profile?: ProfileDto;
  loading: boolean;
}

type AllProps = PropsFromState;

const DashboardPage: React.FC<AllProps> = ({ user, profile, loading }: AllProps) => {
  const [profileLoaded, setProfileLoaded] = useState(!!profile);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!profileLoaded) {
      dispatch(profileActions.getCurrentProfile.request());
      setProfileLoaded(true);
    }
  }, [profileLoaded, profile, dispatch]);

  function renderProfile(): JSX.Element {
    return (
      <div className={styles.DashboardPage}>
        <h1>Dashboard</h1>
        {user && profile ? (
          <>
            <ProfileView user={user} profile={profile} />
            <ExperienceList experiences={profile.experiences} />
          </>
        ) : null}
      </div>
    );
  }

  return <div>{loading ? <Loader /> : renderProfile()}</div>;
};

const mapStateToProps: StateToPropsFunc<PropsFromState> = ({ auth, profile }) => ({
  user: auth.user,
  profile: profile.currentProfile,
  loading: profile.loading,
  errorResponse: profile.errorResponse,
});

export default connect(mapStateToProps)(DashboardPage);
