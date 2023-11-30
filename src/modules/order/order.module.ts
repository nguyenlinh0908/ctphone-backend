import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductModule } from '../product/product.module';
import { WarehouseReceiptModule } from '../warehouse_receipt/warehouse_receipt.module';
import { Order, OrderDetail, OrderDetailSchema, OrderSchema } from './model';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { DeliveryAddressModule } from '../delivery_address/delivery_address.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderDetail.name, schema: OrderDetailSchema },
    ]),
    ProductModule,
    WarehouseReceiptModule,
    DeliveryAddressModule
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
