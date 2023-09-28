import { Types } from 'mongoose';

export class FilterCategoryDto {
  _id?: Types.ObjectId;

  dept?: number;

  parentId?: Types.ObjectId;
}
