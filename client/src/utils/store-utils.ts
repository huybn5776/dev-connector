export function upsertEntityWithSameId<T extends { id: string }>(entities: T[], fetchedEntity: T): T[] {
  const targetIndex = entities.findIndex((e) => e.id === fetchedEntity.id);
  if (targetIndex === -1) {
    return [...entities, fetchedEntity];
  }
  const newEntities = [...entities];
  newEntities[targetIndex] = fetchedEntity;
  return newEntities;
}
