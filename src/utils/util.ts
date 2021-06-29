// eslint-disable-next-line @typescript-eslint/ban-types
export const isEmpty = (value: string | number | object | undefined | null): boolean => {
  if (value === null) {
    return true;
  }
  if (typeof value !== 'number' && value === '') {
    return true;
  }
  if (value === 'undefined' || value === undefined) {
    return true;
  }
  return value !== null && typeof value === 'object' && !Object.keys(value).length;
};
