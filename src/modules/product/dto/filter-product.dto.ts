import { Types } from 'mongoose';

export class FilterProduct {
  name?: string;

  categoryId?: Types.ObjectId;
}
