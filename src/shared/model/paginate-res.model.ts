export class PaginateRes<T> {
  limit: number;
  page: number;
  data: T[];
  totalRecords: number;
  totalPages: number;
}
