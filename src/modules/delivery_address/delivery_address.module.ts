import { Module } from '@nestjs/common';
import { DeliveryAddressController } from './delivery_address.controller';
import { DeliveryAddressService } from './delivery_address.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DeliveryAddress, DeliveryAddressSchema } from './model';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliveryAddress.name, schema: DeliveryAddressSchema },
    ]),
    HttpModule,
  ],
  controllers: [DeliveryAddressController],
  providers: [DeliveryAddressService],
  exports: [DeliveryAddressService],
})
export class DeliveryAddressModule {}
