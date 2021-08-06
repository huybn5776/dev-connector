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
