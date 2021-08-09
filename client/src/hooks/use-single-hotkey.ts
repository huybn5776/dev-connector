import { useMemo, useRef, useEffect, MutableRefObject } from 'react';

import { fromEvent, take, Observable, Subscription, Subscriber } from 'rxjs';
import { filter } from 'rxjs/operators';

export function useSingleHotkey(
  eventFilter: (event: KeyboardEvent) => boolean,
): [Observable<KeyboardEvent>, MutableRefObject<Subscription | null>] {
  const lastSubscription = useRef<Subscription | null>(null);

  const singleHotkey$ = useMemo(() => {
    const hotkey$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(filter(eventFilter));
    let lastSubscriber: Subscriber<KeyboardEvent> | null = null;

    return new Observable<KeyboardEvent>((subscriber) => {
      lastSubscriber?.complete?.();
      lastSubscriber = subscriber;

      lastSubscription.current = hotkey$.pipe(take(1)).subscribe({
        next: (event) => subscriber.next(event),
        complete() {
          subscriber.complete();
          lastSubscriber = null;
        },
      });

      return () => lastSubscription.current?.unsubscribe();
    });
  }, [eventFilter]);

  useEffect(() => () => lastSubscription.current?.unsubscribe(), []);

  return [singleHotkey$, lastSubscription];
}
