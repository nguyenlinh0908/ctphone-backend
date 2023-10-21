import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto } from './dto';
import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';
import { FilterStaffDto } from './dto/filter-staff.dto';
import { Types } from 'mongoose';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  create(@Body() data: CreateStaffDto) {
    return this.staffService.create(data);
  }

  @Patch(':id')
  update(@Param(MongoIdPipe) id: string, @Body() data: UpdateStaffDto) {
    return this.staffService.update(id, data);
  }

  @Get(':id')
  findOne(@Param(MongoIdPipe) id: Types.ObjectId) {
    return this.staffService.findById(id);
  }

  @Get()
  find(@Query() filter: FilterStaffDto) {
    return this.staffService.find(filter)
  }
}
