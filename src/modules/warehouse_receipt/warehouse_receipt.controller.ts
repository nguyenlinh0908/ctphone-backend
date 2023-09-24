import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WarehouseReceiptService } from './warehouse_receipt.service';
import { CreateWarehouseReceiptDto } from './dto/create-warehouse_receipt.dto';
import { UpdateWarehouseReceiptDto } from './dto/update-warehouse_receipt.dto';

@Controller('warehouse-receipt')
export class WarehouseReceiptController {
  constructor(private readonly warehouseReceiptService: WarehouseReceiptService) {}

  @Post()
  create(@Body() createWarehouseReceiptDto: CreateWarehouseReceiptDto) {
    return this.warehouseReceiptService.create(createWarehouseReceiptDto);
  }

  @Get()
  findAll() {
    return this.warehouseReceiptService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.warehouseReceiptService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWarehouseReceiptDto: UpdateWarehouseReceiptDto) {
    return this.warehouseReceiptService.update(+id, updateWarehouseReceiptDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.warehouseReceiptService.remove(+id);
  }
}
