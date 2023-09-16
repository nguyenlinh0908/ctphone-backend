import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Staff, StaffDocument } from './model';
import { Model, Types } from 'mongoose';
import { CreateStaffDto, UpdateStaffDto } from './dto';
import { PaginateRes } from '../../shared/model/paginate-res.model';
import { FilterStaffDto } from './dto/filter-staff.dto';
import { calculateOffset } from 'src/utils/data';
import { fileURLToPath } from 'url';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(Staff.name) private readonly staffModel: Model<StaffDocument>,
  ) {}

  create(data: CreateStaffDto) {
    return this.staffModel.create(data);
  }

  update(staffId: string, data: UpdateStaffDto) {
    return this.staffModel.findByIdAndUpdate(staffId, data, { new: true });
  }

  async find(filter: FilterStaffDto): Promise<PaginateRes<Staff>> {
    const totalRecords = await this.totalRecords();
    const dataOffset = calculateOffset(totalRecords, filter.limit, filter.page);
    const staffs = await this.staffModel
      .aggregate()
      .skip(Number(dataOffset.offset))
      .limit(Number(filter.limit))

    return {
      limit: filter.limit,
      page: filter.page,
      data: staffs,
      totalRecords,
      totalPages: dataOffset.totalPages
    };
  }

  findOne() {
    return this.staffModel.findOne();
  }

  findById(staffId: string) {
    return this.staffModel.findById(staffId);
  }

  totalRecords() {
    return this.staffModel.countDocuments();
  }
}
