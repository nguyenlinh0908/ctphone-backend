import { Transform } from 'class-transformer';
import { OrderStatus } from '../enum';
import { Types } from 'mongoose';
import { ObjectId } from 'mongodb';

export class FilterOrderDto {
  _id?: Types.ObjectId;

  ownerId?: Types.ObjectId;

  status?: OrderStatus;

  code?: any;
}
