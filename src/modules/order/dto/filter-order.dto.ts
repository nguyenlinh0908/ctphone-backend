import { OrderStatus } from '../enum';
import { Types } from 'mongoose';

export class FilterOrderDto {
  _id?: Types.ObjectId;

  ownerId?: Types.ObjectId | string;

  status?: OrderStatus;
}
