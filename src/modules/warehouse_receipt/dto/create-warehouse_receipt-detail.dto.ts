import { Types } from 'mongoose';

export class CreateWarehouseReceiptDetail {
  productId: Types.ObjectId;

  warehouseReceiptId?: Types.ObjectId;

  quantity: number;

  amount: number;
}
