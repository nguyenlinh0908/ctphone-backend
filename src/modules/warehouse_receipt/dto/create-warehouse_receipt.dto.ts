import { WarehouseReceiptStatus } from '../enum';
import { CreateWarehouseReceiptDetail } from './create-warehouse_receipt-detail.dto';

export class CreateWarehouseReceiptDto {
  accountId?: string;

  delivererName: string;

  inputDate: Date;

  status: WarehouseReceiptStatus = WarehouseReceiptStatus.PENDING;

  totalQuantity: number;

  totalAmount: number;

  products: CreateWarehouseReceiptDetail[];
}
