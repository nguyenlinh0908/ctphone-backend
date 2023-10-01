import { Types } from 'mongoose';
import { PaginateFilter } from 'src/shared/model/paginate-filter.model';

export class FilterProduct extends PaginateFilter {
  name?: string;

  categoryId?: Types.ObjectId;
}
