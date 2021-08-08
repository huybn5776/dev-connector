import React, { useState, useRef, useEffect } from 'react';

import clsx from 'clsx';
import { fromEvent, take, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';

import { useOnDestroy } from '@hooks/use-on-destroy';

import styles from './RightMenu.module.scss';

interface Props {
  children: JSX.Element | (JSX.Element | null)[] | null;
}

const RightMenu: React.FC<Props> = ({ children }: Props) => {
  const [visible, setVisible] = useState(false);
  const onDestroy$ = useOnDestroy();
  const uiMenu = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const subscription = fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(filter((event) => event.key === 'Escape'))
      .subscribe(() => setVisible(false));
    return () => subscription.unsubscribe();
  }, []);

  function onMenuClick(event: React.MouseEvent<HTMLElement>): void {
    if (visible || (event.target as HTMLElement).classList.contains(styles.menuItem)) {
      setVisible(false);
    } else {
      setVisible(true);
      event.stopPropagation();
      fromEvent(document, 'click')
        .pipe(
          takeUntil(onDestroy$),
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          takeUntil(fromEvent(uiMenu.current!, 'click')),
          take(1),
        )
        .subscribe(() => setVisible(false));
    }
  }

  return (
    <div
      className={clsx('ui', 'text', ' menu', styles.RightMenu, visible && 'visible')}
      onClick={onMenuClick}
      ref={uiMenu}
    >
      <div className={clsx('ui', 'right', 'dropdown', 'item')}>
        <i className={clsx('icon', 'ellipsis', 'horizontal', styles.menuIcon)} />
        <div className={clsx('menu', 'transition', visible && 'visible', styles.menu)}>{children}</div>
      </div>
    </div>
  );
};

export default RightMenu;

type MenuItemProps = {
  children: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const MenuItem: React.FC<MenuItemProps> = ({ children, ...rest }: MenuItemProps) => {
  return (
    <button className={clsx('item', styles.menuItem)} type="button" {...rest}>
      {children}
    </button>
  );
};
