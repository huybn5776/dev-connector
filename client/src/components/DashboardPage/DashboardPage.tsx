import React, { useEffect, useState } from 'react';

import { AxiosResponse } from 'axios';
import { useDispatch, connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { profileActions } from '@actions';
import ProfileViewCard from '@components/DashboardPage/ProfileViewCard/ProfileViewCard';
import ExperienceList from '@components/ExperienceList/ExperienceList';
import Loader from '@components/Loader/Loader';
import UserInfoCard from '@components/UserInfoCard/UserInfoCard';
import { ProfileDto } from '@dtos/profile.dto';
import { UserDto } from '@dtos/user.dto';
import { HttpException } from '@exceptions';
import { StateToPropsFunc } from '@store';

import EducationList from '../EducationList/EducationList';
import styles from './DashboardPage.module.scss';

interface PropsFromState {
  user?: UserDto;
  profile?: ProfileDto;
  loading: boolean;
  errorResponse?: AxiosResponse<HttpException>;
}

type AllProps = PropsFromState;

const DashboardPage: React.FC<AllProps> = ({ user, profile, loading, errorResponse }: AllProps) => {
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
      <>
        {user && <UserInfoCard user={user} />}
        {user && profile ? (
          <>
            <ProfileViewCard user={user} profile={profile} />
            <ExperienceList experiences={profile.experiences} />
            <EducationList educations={profile.educations} />
          </>
        ) : null}
        {errorResponse?.status === 404 ? (
          <p className={styles.noProfileMessage}>
            You haven&apos;t created profile yet, <Link to="edit-profile">create now?</Link>
          </p>
        ) : null}
      </>
    );
  }

  return (
    <div className="page-layout">
      <h1>Dashboard</h1>
      {loading && !profile ? <Loader /> : renderProfile()}
    </div>
  );
};

const mapStateToProps: StateToPropsFunc<PropsFromState> = ({ auth, profile }) => ({
  user: auth.user,
  profile: profile.currentProfile,
  loading: profile.loading,
  errorResponse: profile.errorResponse,
});

export default connect(mapStateToProps)(DashboardPage);
