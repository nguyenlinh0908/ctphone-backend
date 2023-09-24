import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateWarehouseReceiptDto } from './dto/create-warehouse_receipt.dto';
import { UpdateWarehouseReceiptDto } from './dto/update-warehouse_receipt.dto';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import {
  WarehouseReceipt,
  WarehouseReceiptDetail,
  WarehouseReceiptDetailDocument,
  WarehouseReceiptDocument,
} from './model';
import { Connection, Model, Types } from 'mongoose';
import { transaction } from 'src/utils/data';

@Injectable()
export class WarehouseReceiptService {
  constructor(
    @InjectModel(WarehouseReceipt.name)
    private warehouseReceiptModel: Model<WarehouseReceiptDocument>,
    @InjectModel(WarehouseReceiptDetail.name)
    private warehouseReceiptDetailModel: Model<WarehouseReceiptDetailDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  async create(createWarehouseReceiptDto: CreateWarehouseReceiptDto) {
    return transaction(this.connection, async (session) => {
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
              warehouseReceipxtId: warehouseReceiptCreated._id,
            },
          },
        });
      }

      this.warehouseReceiptDetailModel.bulkWrite(
        bulkWriteWarehouseReceiptDetails,
      );
      return warehouseReceiptCreated;
    });
  }

  findAll() {
    return `This action returns all warehouseReceipt`;
  }

  findOne(id: number) {
    return `This action returns a #${id} warehouseReceipt`;
  }

  async update(
    id: string,
    updateWarehouseReceiptDto: UpdateWarehouseReceiptDto,
  ) {
    const warehouseReceiptUpdated =
      await this.warehouseReceiptModel.findByIdAndUpdate(
        id,
        updateWarehouseReceiptDto,
      );
    if (!warehouseReceiptUpdated)
      throw new HttpException('update faild', HttpStatus.BAD_REQUEST);
    
    if (
      updateWarehouseReceiptDto.products.length <= 0 ||
      !updateWarehouseReceiptDto.products
    )
      return warehouseReceiptUpdated;

    let bulkWriteWarehouseReceiptDetails = [];
    for (const product of updateWarehouseReceiptDto.products) {
      bulkWriteWarehouseReceiptDetails.push({
        updateOne: {
          filter: { productId: product.productId },
          update: {
            $set: { ...product, warehouseId: warehouseReceiptUpdated._id },
          },
        },
      });
    }

    this.warehouseReceiptDetailModel.bulkWrite(
      bulkWriteWarehouseReceiptDetails,
    );
  }

  remove(id: number) {
    return `This action removes a #${id} warehouseReceipt`;
  }
}
