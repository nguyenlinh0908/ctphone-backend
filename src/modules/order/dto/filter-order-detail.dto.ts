import { Types } from 'mongoose';

export class FilterOrderDetailDto {
  orderId?: Types.ObjectId | string;

  productId?: Types.ObjectId;
}
