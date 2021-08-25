import * as R from 'ramda';

export const isNilOrEmpty = R.either(R.isEmpty, R.isNil) as (value: unknown) => value is null | undefined;
export const isNotNilOrEmpty = R.complement(isNilOrEmpty) as (value: unknown) => value is Record<string, unknown>;

export function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function defaultIfNil<T>(value: T, defaultValue: T): T {
  return R.isNil(value) ? defaultValue : value;
}

export function getPathValue<T, V>(path: string, obj: T): V {
  return R.path(path.split('.'), obj) as V;
}

export function setPathValue<T extends Record<string, unknown>, V>(path: string, value: V, obj: T): T {
  return R.assocPath(path.split('.'), value, obj);
}

export function deletePathValue<T extends Record<string, unknown>>(path: string, obj: T): T {
  return R.dissocPath(path.split('.'), obj);
}

export function isNestedEmpty<T>(value: T): boolean {
  if (isNilOrEmpty(value)) {
    return true;
  }
  return Object.values(value).every((v) => isNilOrEmpty(v) && isNestedEmpty(v));
}

export function deleteNilProperties<T>(obj: T): Partial<T> {
  const newObj = { ...obj };
  (Object.keys(newObj) as (keyof T)[]).forEach((key) => {
    if (R.isNil(newObj[key]) || isNestedEmpty(newObj[key])) {
      delete newObj[key];
    }
  });
  return newObj;
}

type PropertiesWhereMarker<T, K> = {
  [Key in keyof T]: T[Key] extends K ? Key : never;
};
type PropertiesWhere<T, K> = {
  [Key in PropertiesWhereMarker<T, K>[keyof T]]: T[Key];
};

export type StringOrNumberPropertiesOf<T> = keyof PropertiesWhere<Required<T>, string>;

export function indexOfBy<T, K extends StringOrNumberPropertiesOf<T>>(field: K, items: T[]): Record<string, number> {
  const indexOfMap = {} as Record<K, number>;
  items.forEach((item, index) => {
    indexOfMap[item[field]] = index;
  });
  return indexOfMap;
}
