import { Types } from 'mongoose';
import { MediaType } from '../enum';

export class CreateMediaDto {
  url: string;
  type: MediaType;
  ownerId?: Types.ObjectId;
}
