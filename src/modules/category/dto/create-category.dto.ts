import { Types } from 'mongoose';
export class CreateCategoryDto {
  name: string;

  parentId?: Types.ObjectId;
}
