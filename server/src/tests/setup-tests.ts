import { Types } from 'mongoose';

type DynamicObjectId = undefined | string | Types.ObjectId | { id?: string; _id?: string | Types.ObjectId };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface Matchers<R> {
      toHaveSameId(expected: DynamicObjectId): CustomMatcherResult;
    }
  }
}

expect.extend({
  toHaveSameId(received: DynamicObjectId, expected: DynamicObjectId): jest.CustomMatcherResult {
    const receivedId = idToString(received);
    const expectedId = idToString(expected);
    const pass = receivedId === expectedId;
    return {
      pass,
      message: () => (pass ? '' : `expected ObjectId '${expectedId}' to be '${receivedId}'`),
    };
  },
});

function idToString(entity: DynamicObjectId): string | undefined {
  if (!entity) {
    return undefined;
  }
  if (typeof entity === 'string') {
    return entity;
  }
  if (entity instanceof Types.ObjectId) {
    return entity.toString();
  }
  if ('id' in entity && entity.id) {
    return entity.id;
  }
  if ('_id' in entity) {
    if (typeof entity._id === 'string') {
      return entity._id;
    }
    if (entity._id instanceof Types.ObjectId) {
      return entity._id?.toString();
    }
  }
  return undefined;
}
