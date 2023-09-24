import { PartialType } from '@nestjs/mapped-types';
import { CreateWarehouseReceiptDto } from './create-warehouse_receipt.dto';

export class UpdateWarehouseReceiptDto extends PartialType(CreateWarehouseReceiptDto) {}
