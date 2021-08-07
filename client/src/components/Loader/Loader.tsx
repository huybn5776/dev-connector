import React from 'react';

import clsx from 'clsx';

interface Props {
  className?: string;
}

const Loader: React.FC<Props> = ({ className }: Props) => (
  <div className={clsx('ui', 'active', 'inline', 'loader', className)} />
);

export default Loader;
