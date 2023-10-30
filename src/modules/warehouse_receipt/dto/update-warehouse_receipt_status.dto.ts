import { WarehouseReceiptStatus } from '../enum';

export class UpdateWarehouseReceiptStatusDto {
  status: WarehouseReceiptStatus = WarehouseReceiptStatus.PENDING;
}
