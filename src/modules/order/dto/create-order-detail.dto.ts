import { Types } from 'mongoose';

export class CreateOrderDetailDto {
  productId: Types.ObjectId;

  quantity: number;

  amount: number;
}
