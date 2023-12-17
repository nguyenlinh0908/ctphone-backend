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
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IDistrict, IProvince } from './interface';

@UseInterceptors(ResTransformInterceptor)
@Roles(RoleType.CUSTOMER, RoleType.ADMIN, RoleType.STAFF)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('delivery-address')
export class DeliveryAddressController {
  constructor(
    private deliveryAddressService: DeliveryAddressService,
    private readonly httpService: HttpService,
  ) {}

  @Post()
  async createDeliveryAddress(
    @Body() data: CreateDeliveryAddressDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    if (data.isDefault) {
      await this.deliveryAddressService.updateDefaultToNormal(
        new ObjectId(currentUser._id),
      );
    }
    return this.deliveryAddressService.create({
      ...data,
      accountId: new ObjectId(currentUser._id),
    });
  }

  @Patch(':id')
  async updateDeliveryAddress(
    @Param('id') id: Types.ObjectId,
    @Body() data: UpdateDeliveryAddressDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    if (data.isDefault) {
      await this.deliveryAddressService.updateDefaultToNormal(
        new ObjectId(currentUser._id),
      );
    }
    return this.deliveryAddressService.updateOneById(id, data);
  }

  @Get(':id')
  deliveryAddress(
    @Param('id') id: Types.ObjectId,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    return this.deliveryAddressService.findOne({
      _id: new ObjectId(id),
      accountId: new ObjectId(currentUser._id),
    });
  }

  @Delete(':id')
  deleteDeliveryAddress(@Param() id: string) {
    return this.deliveryAddressService.delete(id);
  }

  @Get('/profile/me')
  myDeliveryAddress(@CurrentUser() currentUser: IJwtPayload) {
    return this.deliveryAddressService.findByAccountId(currentUser._id);
  }

  @Get('/default/address')
  defaultDeliveryAddress(@CurrentUser() currentUser: IJwtPayload) {
    return this.deliveryAddressService.findOne({
      accountId: new ObjectId(currentUser._id),
      isDefault: true,
    });
  }

  @Get('/location/p')
  async provinces() {
    const data = await firstValueFrom(
      this.httpService.get<IProvince[]>(
        'https://provinces.open-api.vn/api/p?depth=2',
      ),
    );
    return data.data;
  }

  @Get('/location/p/:id')
  async districts(@Param('id') provinceCode: string) {
    const data = await firstValueFrom(
      this.httpService.get<IProvince>(
        `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`,
      ),
    );
    return data.data;
  }

  @Get('/location/d/:id')
  async wards(@Param('id') districtCode: string) {
    const data = await firstValueFrom(
      this.httpService.get<IDistrict>(
        `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`,
      ),
    );
    return data.data;
  }
}
