import { Types } from 'mongoose';

export class FilterOrderDetailDto {
  _id?: Types.ObjectId;

  orderId?: Types.ObjectId;

  productId?: Types.ObjectId;
}
