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
import { CachingModule } from 'src/libs/caching/src';
import { ProductModule } from '../product/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WarehouseReceipt.name, schema: WarehouseReceiptSchema },
      {
        name: WarehouseReceiptDetail.name,
        schema: WarehouseReceiptDetailSchema,
      },
    ]),
    CachingModule,
    ProductModule
  ],
  controllers: [WarehouseReceiptController],
  providers: [WarehouseReceiptService],
  exports:[WarehouseReceiptService]
})
export class WarehouseReceiptModule {}
