import { Types } from 'mongoose';

export class FilterChildrenCategoryDto {
  _id: Types.ObjectId;

  dept: number = 1;
}
