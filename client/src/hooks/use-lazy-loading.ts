import { useRef, useMemo } from 'react';

export function useLazyLoading<T>(
  entities: T[],
  pageSize: number,
  total: number,
  fetchFn: (offset: number) => void,
): (index: number, intersection: boolean) => void {
  const lastFetchIndex = useRef(entities.length);
  const intersectionIndexes = useMemo(() => new Set<number>(), []);
  lastFetchIndex.current = entities.length;

  function updateIntersectionIndexes(index: number, intersection: boolean): void {
    if (intersection) {
      intersectionIndexes.add(index);
    } else {
      intersectionIndexes.delete(index);
    }
    const intersectionEnd = Math.max(...Array.from(intersectionIndexes));
    const preLoadPostsGap = 5;

    if (intersection && intersectionEnd > lastFetchIndex.current - preLoadPostsGap && total > lastFetchIndex.current) {
      fetchFn(entities.length);
      lastFetchIndex.current += pageSize;
    }
  }

  return updateIntersectionIndexes;
}
