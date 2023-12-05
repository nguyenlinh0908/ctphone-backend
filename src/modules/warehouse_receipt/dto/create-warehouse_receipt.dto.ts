import { Types } from 'mongoose';
import { CreateWarehouseReceiptDetail } from './create-warehouse_receipt-detail.dto';

export class CreateWarehouseReceiptDto {
  accountId?: Types.ObjectId;

  delivererName: string;

  deliveryTime: Date;

  products: CreateWarehouseReceiptDetail[];
}
