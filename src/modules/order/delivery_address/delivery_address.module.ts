import { Module } from '@nestjs/common';
import { DeliveryAddressController } from './delivery_address.controller';
import { DeliveryAddressService } from './delivery_address.service';
import { MongooseModule } from '@nestjs/mongoose';
import { DeliveryAddress, DeliveryAddressSchema } from './model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliveryAddress.name, schema: DeliveryAddressSchema },
    ]),
  ],
  controllers: [DeliveryAddressController],
  providers: [DeliveryAddressService],
  exports: [],
})
export class DeliveryAddressModule {}
