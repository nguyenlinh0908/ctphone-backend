import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';
import { CreateDeliveryAddressDto } from 'src/modules/delivery_address/dto';

export class CreateOfflineOrderDto extends PartialType(CreateOrderDto) {
  deliverAddress: CreateDeliveryAddressDto;
}
