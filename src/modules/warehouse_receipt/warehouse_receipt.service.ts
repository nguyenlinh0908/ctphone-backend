import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateWarehouseReceiptDto } from './dto/create-warehouse_receipt.dto';
import { UpdateWarehouseReceiptDto } from './dto/update-warehouse_receipt.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  WarehouseReceipt,
  WarehouseReceiptDetail,
  WarehouseReceiptDetailDocument,
  WarehouseReceiptDocument,
} from './model';
import { Model } from 'mongoose';

@Injectable()
export class WarehouseReceiptService {
  constructor(
    @InjectModel(WarehouseReceipt.name)
    private warehouseReceiptModel: Model<WarehouseReceiptDocument>,
    @InjectModel(WarehouseReceiptDetail.name)
    private warehouseReceiptDetailModel: Model<WarehouseReceiptDetailDocument>,
  ) {}

  async create(createWarehouseReceiptDto: CreateWarehouseReceiptDto) {
    const warehouseReceiptCreated = await this.warehouseReceiptModel.create(
      createWarehouseReceiptDto,
    );

    if (!warehouseReceiptCreated) {
      throw new HttpException('create fail', HttpStatus.BAD_REQUEST);
    }

    let bulkWriteWarehouseReceiptDetails = [];
    for (const product of createWarehouseReceiptDto.products) {
      bulkWriteWarehouseReceiptDetails.push({
        insertOne: {
          document: {
            ...product,
            warehouseReceiptId: warehouseReceiptCreated._id,
          },
        },
      });
    }

    this.warehouseReceiptDetailModel.bulkWrite(
      bulkWriteWarehouseReceiptDetails,
    );
    return warehouseReceiptCreated;
  }

  findAll() {
    return `This action returns all warehouseReceipt`;
  }

  findOne(id: number) {
    return `This action returns a #${id} warehouseReceipt`;
  }

  update(id: number, updateWarehouseReceiptDto: UpdateWarehouseReceiptDto) {
    return `This action updates a #${id} warehouseReceipt`;
  }

  remove(id: number) {
    return `This action removes a #${id} warehouseReceipt`;
  }
}
