import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { EventListener } from './event.listener';
import { ProductModule } from '../product/product.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [EventEmitterModule.forRoot(), ProductModule],
  providers: [EventListener],
})
export class EventModule {}
