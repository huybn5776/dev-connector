export interface PaginationResult<T> {
  total: number;
  offset?: number;
  items: T[];
}
