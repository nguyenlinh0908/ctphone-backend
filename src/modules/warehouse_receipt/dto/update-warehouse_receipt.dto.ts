import { PartialType } from '@nestjs/mapped-types';
import { CreateWarehouseReceiptDto } from './create-warehouse_receipt.dto';
import { WarehouseReceiptStatus } from '../enum';

export class UpdateWarehouseReceiptDto extends PartialType(
  CreateWarehouseReceiptDto,
) {
  status: WarehouseReceiptStatus = WarehouseReceiptStatus.PENDING;
}
