import { Types } from 'mongoose';

export class UpdateMediaDto {
  mediaIds?: Types.ObjectId[];

  ownerId?: Types.ObjectId;
}
