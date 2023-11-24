import { Types } from 'mongoose';
import { WarehouseReceiptStatus } from '../enum';
import { CreateWarehouseReceiptDetail } from './create-warehouse_receipt-detail.dto';

export class CreateWarehouseReceiptDto {
  accountId?: Types.ObjectId;

  delivererName: string;

  deliveryTime: Date;

  products: CreateWarehouseReceiptDetail[];
}
