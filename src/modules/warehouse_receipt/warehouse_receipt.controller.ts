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
import { Types } from 'mongoose';
import { ResTransformInterceptor } from 'src/shared/interceptor';
import { CurrentUser, Roles } from '../auth/decorator';
import { RoleType } from '../auth/enum';
import { JwtAuthGuard, RolesGuard } from '../auth/guard';
import { IJwtPayload } from '../auth/interface';
import { CreateWarehouseReceiptDto } from './dto/create-warehouse_receipt.dto';
import { UpdateWarehouseReceiptDto } from './dto/update-warehouse_receipt.dto';
import { WarehouseReceiptService } from './warehouse_receipt.service';

@UseInterceptors(ResTransformInterceptor)
@Controller('warehouse-receipt')
export class WarehouseReceiptController {
  constructor(
    private readonly warehouseReceiptService: WarehouseReceiptService,
  ) {}

  @Roles(RoleType.ADMIN, RoleType.STAFF)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  create(
    @Body() createWarehouseReceiptDto: CreateWarehouseReceiptDto,
    @CurrentUser() currentUser: IJwtPayload,
  ) {
    createWarehouseReceiptDto.accountId = currentUser._id;

    return this.warehouseReceiptService.create(createWarehouseReceiptDto);
  }

  @Get('all')
  findAll() {
    return this.warehouseReceiptService.findAll();
  }

  @Get(':id/detail')
  findProductsByWarehouseReceiptId(@Param('id') id: Types.ObjectId) {
    return this.warehouseReceiptService.findProductsByWarehouseReceiptId(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehouseReceiptService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWarehouseReceiptDto: UpdateWarehouseReceiptDto,
  ) {
    return this.warehouseReceiptService.update(id, updateWarehouseReceiptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.warehouseReceiptService.remove(+id);
  }
}
