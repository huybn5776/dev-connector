import { useEffect, useMemo } from 'react';

import { Subject, Observable } from 'rxjs';

export function useOnDestroy(): Observable<void> {
  const subject = useMemo(() => new Subject<void>(), []);
  const destroy$ = useMemo(() => subject.asObservable(), [subject]);

  useEffect(() => {
    return () => {
      subject.next();
      subject.complete();
    };
  }, [subject]);

  return destroy$;
}
