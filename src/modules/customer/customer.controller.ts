import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto';
import { CustomerService } from './customer.service';
import { ResTransformInterceptor } from 'src/shared/interceptor';
import { CurrentUser, Roles } from '../auth/decorator';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { Types } from 'mongoose';
import { RoleType } from '../auth/enum';
import { IJwtPayload } from '../auth/interface';
import { I18nService } from 'nestjs-i18n';

@UseInterceptors(ResTransformInterceptor)
@Controller('customer')
export class CustomerController {
  constructor(
    private readonly userService: CustomerService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('all')
  findAll() {
    return this.userService.findAll();
  }

  @Roles(RoleType.ADMIN, RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findById(
    @Param('id') id: Types.ObjectId,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    if (!currentUser.roles.includes(RoleType.ADMIN) && currentUser._id != id)
      throw new HttpException(
        this.i18nService.t('auth.UNAUTHORIZED'),
        HttpStatus.BAD_REQUEST,
      );

    return this.userService.findById(id);
  }
}
