import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { OrderModule } from '../order/order.module';
import { DeliveryAddressModule } from '../delivery_address/delivery_address.module';

@Module({
  imports: [OrderModule, DeliveryAddressModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
