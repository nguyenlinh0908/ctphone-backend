import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from '../product/product.module';
import { WarehouseReceiptModule } from '../warehouse_receipt/warehouse_receipt.module';
import { Order, OrderDetail, OrderDetailSchema, OrderSchema } from './model';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DeliveryAddressModule } from '../delivery_address/delivery_address.module';
import { CachingModule } from 'src/libs/caching/src';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderDetail.name, schema: OrderDetailSchema },
    ]),
    ProductModule,
    WarehouseReceiptModule,
    DeliveryAddressModule,
    CachingModule
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
