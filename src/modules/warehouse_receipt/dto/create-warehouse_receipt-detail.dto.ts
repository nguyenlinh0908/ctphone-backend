import { Types } from 'mongoose';

export class CreateWarehouseReceiptDetail {
  productId: Types.ObjectId;

  warehouseReceiptId?: Types.ObjectId;

  unit: string;

  quantity: number;

  amountUnit: number;

  amount: number;
}
