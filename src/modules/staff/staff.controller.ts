import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto } from './dto';
import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';
import { FilterStaffDto } from './dto/filter-staff.dto';
import { Types } from 'mongoose';
import { ResTransformInterceptor } from 'src/shared/interceptor';
import { CurrentUser, Roles } from '../auth/decorator';
import { RoleType } from '../auth/enum';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { IJwtPayload } from '../auth/interface';
import { I18nService } from 'nestjs-i18n';

@UseInterceptors(ResTransformInterceptor)
@Controller('staff')
export class StaffController {
  constructor(
    private readonly staffService: StaffService,
    private readonly i18nService: I18nService,
  ) {}

  @Post()
  create(@Body() data: CreateStaffDto) {
    return this.staffService.create(data);
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  update(@Param(MongoIdPipe) id: string, @Body() data: UpdateStaffDto) {
    return this.staffService.update(id, data);
  }

  @Roles(RoleType.ADMIN, RoleType.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  findOne(
    @Param(MongoIdPipe) id: Types.ObjectId,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    if (!currentUser.roles.includes(RoleType.ADMIN) && id != currentUser._id)
      throw new HttpException(this.i18nService.t("auth.UNAUTHORIZED"), HttpStatus.BAD_REQUEST);
    return this.staffService.findById(id);
  }

  @Get()
  find(@Query() filter: FilterStaffDto) {
    return this.staffService.find(filter);
  }
}
