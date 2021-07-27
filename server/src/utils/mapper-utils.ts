import { mapFrom } from '@automapper/core';
import type { MapFromReturn } from '@automapper/types';

export function mapId<S extends { _id?: unknown }, D extends { id?: string }>(): [
  (destination: D) => D['id'],
  MapFromReturn<S, D, string>,
] {
  return [(destination: D) => destination.id, mapFrom((source: S) => `${source._id}`)];
}
