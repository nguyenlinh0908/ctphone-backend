import { Module } from '@nestjs/common';
import { WarehouseReceiptService } from './warehouse_receipt.service';
import { WarehouseReceiptController } from './warehouse_receipt.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WarehouseReceipt,
  WarehouseReceiptDetail,
  WarehouseReceiptDetailSchema,
  WarehouseReceiptSchema,
} from './model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WarehouseReceipt.name, schema: WarehouseReceiptSchema },
      {
        name: WarehouseReceiptDetail.name,
        schema: WarehouseReceiptDetailSchema,
      },
    ]),
  ],
  controllers: [WarehouseReceiptController],
  providers: [WarehouseReceiptService],
})
export class WarehouseReceiptModule {}
