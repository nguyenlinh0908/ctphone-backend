import { Types } from 'mongoose';
import { OrderType } from 'src/shared/enum';
import { PaginateFilter } from 'src/shared/model/paginate-filter.model';

export class FilterProduct extends PaginateFilter {
  name?: string;

  categoryId?: Types.ObjectId;

  order?: string;

  dir?: OrderType = OrderType.ASC;
}
