import { indexOfBy } from '@utils/object-utils';

export function upsertEntitiesWithSameId<T extends { id: string }>(
  entities: T[],
  fetchedEntities: T[],
  updater: (entity: T, fetchedEntity: T) => T,
): T[] {
  const entitiesIndexMap: Record<string, number> = indexOfBy<{ id: string }, 'id'>('id', entities);
  const newEntities = [...entities];
  fetchedEntities.forEach((entity) => {
    const entityIndex = entitiesIndexMap[entity.id];
    if (entityIndex === undefined) {
      newEntities.push(entity);
    } else {
      newEntities[entityIndex] = updater(newEntities[entityIndex], entity);
    }
  });
  return newEntities;
}

export function upsertEntityWithSameId<T extends { id: string }>(entities: T[], fetchedEntity: T): T[] {
  const targetIndex = entities.findIndex((e) => e.id === fetchedEntity.id);
  if (targetIndex === -1) {
    return [...entities, fetchedEntity];
  }
  const newEntities = [...entities];
  newEntities[targetIndex] = fetchedEntity;
  return newEntities;
}

export function updateEntityWithId<T extends { id: string }>(
  entities: T[],
  id: string,
  updater: (entity: T) => T,
): T[] {
  const targetIndex = entities.findIndex((e) => e.id === id);
  if (targetIndex === -1) {
    return entities;
  }
  const newEntities = [...entities];
  newEntities[targetIndex] = updater(entities[targetIndex]);
  return newEntities;
}
