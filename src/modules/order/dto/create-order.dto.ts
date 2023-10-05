import { CreateOrderDetailDto } from './create-order-detail.dto';
import { Types } from 'mongoose';

export class CreateOrderDto {
  note?: string;

  products: CreateOrderDetailDto[];

  ownerId?: Types.ObjectId;

  merchandiserId?: Types.ObjectId;
}
