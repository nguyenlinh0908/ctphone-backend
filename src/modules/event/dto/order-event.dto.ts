import { Types } from 'mongoose';

export class OrderEventDto {
  productIds: Types.ObjectId[];
  constructor(productIds: Types.ObjectId[]) {
    this.productIds = productIds;
  }
}
