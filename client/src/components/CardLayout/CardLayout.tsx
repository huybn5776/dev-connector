import React, { ReactNode } from 'react';

import clsx from 'clsx';
import { Link } from 'react-router-dom';

import styles from './CardLayout.module.scss';

interface Props {
  title?: string;
  children: JSX.Element | JSX.Element[];
}

const CardLayout: React.FC<Props> = ({ title, children }: Props) => {
  const header = Array.isArray(children) ? children.find(({ type }) => type === CardHeader) : null;
  const content = Array.isArray(children) ? children.find(({ type }) => type === CardContent) : children;
  const actions = Array.isArray(children) ? children.find(({ type }) => type === CardActions) : null;

  return (
    <div className={styles.CardLayout}>
      {header ?? (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}

      {content}
      {actions}
    </div>
  );
};

export default CardLayout;

interface CardComponents {
  children: ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardComponents> = ({ children, className }: CardComponents) => (
  <header className={clsx(styles.cardHeader, className)}>{children}</header>
);

export const CardTitle: React.FC<CardComponents> = ({ children, className }: CardComponents) => (
  <p className={clsx(styles.cardTitle, className)}>{children}</p>
);

type CardHeaderActionIconProps = React.HTMLAttributes<HTMLElement> & {
  className?: string;
};

export const CardHeaderActionIcon: React.FC<CardHeaderActionIconProps> = ({
  className,
  ...rest
}: CardHeaderActionIconProps) => <i {...rest} className={clsx('icon', styles.cardHeaderActionIcon, className)} />;

interface CardHeaderLinkProps {
  to: string;
  iconClassName: string;
  className?: string;
}

export const CardHeaderLink: React.FC<CardHeaderLinkProps> = ({
  to,
  iconClassName,
  className,
}: CardHeaderLinkProps) => (
  <Link to={to} className={className}>
    <CardHeaderActionIcon className={iconClassName} />
  </Link>
);

export const CardContent: React.FC<CardComponents> = ({ children, className }: CardComponents) => (
  <div className={clsx(styles.cardContent, className)}>{children}</div>
);

export const CardActions: React.FC<CardComponents> = ({ children, className }: CardComponents) => (
  <footer className={clsx(styles.cardActions, className)}>{children}</footer>
);

interface CardRowProps {
  children: ReactNode;
}
export const CardRow: React.FC<CardRowProps> = ({ children }: CardRowProps) => (
  <div className={styles.cardRow}>{children}</div>
);

interface CardRowToolbarProps {
  children: ReactNode;
}

export const CardRowToolbar: React.FC<CardRowToolbarProps> = ({ children }: CardRowToolbarProps) => (
  <div className={styles.cardRowToolbar}>{children}</div>
);
