import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DeliveryAddressService } from './delivery_address.service';
import { CreateDeliveryAddressDto, UpdateDeliveryAddressDto } from './dto';
import { CurrentUser, Roles } from 'src/modules/auth/decorator';
import { IJwtPayload } from 'src/modules/auth/interface';
import { ResTransformInterceptor } from 'src/shared/interceptor';
import { JwtAuthGuard, RolesGuard } from 'src/modules/auth/guard';
import { RoleType } from 'src/modules/auth/enum';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';

@UseInterceptors(ResTransformInterceptor)
@Roles(RoleType.CUSTOMER)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('delivery-address')
export class DeliveryAddressController {
  constructor(private deliveryAddressService: DeliveryAddressService) {}

  @Post()
  createDeliveryAddress(
    @Body() data: CreateDeliveryAddressDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    return this.deliveryAddressService.create({
      ...data,
      accountId: new ObjectId(currentUser._id),
    });
  }

  @Patch(':id')
  updateDeliveryAddress(
    @Param("id") id: Types.ObjectId,
    @Body() data: UpdateDeliveryAddressDto,
  ) {
    return this.deliveryAddressService.updateOne(id, data);
  }

  @Get(':id')
  deliveryAddress(@CurrentUser() currentUser: IJwtPayload) {
    return this.deliveryAddressService.findOne({
      accountId: currentUser._id,
    });
  }

  @Delete(':id')
  deleteDeliveryAddress(@Param() id: string) {
    return this.deliveryAddressService.delete(id);
  }

  @Get("/profile/me")
  myDeliveryAddress(@CurrentUser() currentUser: IJwtPayload) {
    return this.deliveryAddressService.findByAccountId(currentUser._id);
  }
}
