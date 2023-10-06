import { OrderStatus } from '../enum';
import { Types } from 'mongoose';

export class FilterOrderDto {
  ownerId: Types.ObjectId | string;

  status?: OrderStatus;
}
