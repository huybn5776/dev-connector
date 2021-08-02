import React, { useEffect } from 'react';

import clsx from 'clsx';
import { useDispatch, connect } from 'react-redux';

import { profileActions } from '@actions';
import Loader from '@components/Loader/Loader';
import { GithubRepo } from '@interfaces/github-repo';
import { StateToPropsFunc } from '@store';

import styles from './ProfileGithubRepoView.module.scss';

interface PropsFromState {
  githubRepos: GithubRepo[];
  loading: boolean;
}

interface Props {
  githubUsername: string;
}

type AllProps = Props & PropsFromState;

const ProfileGithubRepoView: React.FC<AllProps> = ({ githubUsername, githubRepos, loading }: AllProps) => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(profileActions.getGithubRepos.request(githubUsername));

    return () => {
      dispatch(profileActions.clearGithubRepos());
    };
  }, [githubUsername, dispatch]);

  function renderGithubRow(githubRepo: GithubRepo): JSX.Element {
    const url = `https://github.com/${githubRepo.owner}/${githubRepo.name}`;
    return (
      <div className={styles.githubRow} key={url}>
        <div className={styles.githubText}>
          <a className={styles.githubRepoName} href={url}>
            {githubUsername === githubRepo.owner ? '' : `${githubRepo.owner}/`}
            {githubRepo.name}
          </a>
          <p>{githubRepo.description}</p>
        </div>
        <div className={styles.githubStatus}>
          <p className={styles.githubStarts}>Starts: {githubRepo.stargazerCount}</p>
          <p className={styles.githubWatchers}>Watchers: {githubRepo.watcherCount}</p>
          <p className={styles.githubForks}>Forks: {githubRepo.forkCount}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.ProfileGithubRepoView}>
      <h2 className={styles.profileGithubTitle}>
        <i className={clsx('icon', 'github')} />
        Github Repos
      </h2>
      {loading ? <Loader /> : githubRepos.map(renderGithubRow)}
    </div>
  );
};

const mapStateToProps: StateToPropsFunc<PropsFromState> = ({ profile }) => ({
  githubRepos: profile.githubRepos,
  loading: profile.loading,
});

export default connect(mapStateToProps)(ProfileGithubRepoView);
