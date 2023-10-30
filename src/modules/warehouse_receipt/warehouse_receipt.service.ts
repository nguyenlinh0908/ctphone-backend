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
import { ObjectId } from 'mongodb';
import { Product } from '../product/models';
import { WarehouseReceiptStatus } from './enum';
import { UpdateWarehouseReceiptStatusDto } from './dto';

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
      const warehouseReceiptCreated = await this.warehouseReceiptModel.create({
        ...createWarehouseReceiptDto,
        totalQuantity: createWarehouseReceiptDto.products.reduce(
          (quantity, produce) => quantity + produce.quantity,
          0,
        ),
        totalAmount: createWarehouseReceiptDto.products.reduce(
          (quantity, produce) => quantity + produce.amount,
          0,
        ),
        accountId: new ObjectId(createWarehouseReceiptDto.accountId),
      });

      if (!warehouseReceiptCreated) {
        throw new HttpException('create fail', HttpStatus.BAD_REQUEST);
      }

      let bulkWriteWarehouseReceiptDetails = [];
      for (const product of createWarehouseReceiptDto.products) {
        bulkWriteWarehouseReceiptDetails.push({
          insertOne: {
            document: {
              ...product,
              productId: new ObjectId(product.productId),
              warehouseReceiptId: new ObjectId(warehouseReceiptCreated._id),
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
    return this.warehouseReceiptModel.find();
  }

  findProductsByWarehouseReceiptId(warehouseReceiptId: Types.ObjectId) {
    return this.warehouseReceiptDetailModel
      .find({ warehouseReceiptId: new ObjectId(warehouseReceiptId) })
      .populate('productId', '', Product.name);
  }

  findOne(id: number) {
    return `This action returns a #${id} warehouseReceipt`;
  }

  findOneById(id: Types.ObjectId) {
    return this.warehouseReceiptModel.findById(id);
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

  findByIdAndUpdateStatus(
    warehouseReceiptId: Types.ObjectId,
    data: UpdateWarehouseReceiptStatusDto,
  ) {
    return this.warehouseReceiptModel.findByIdAndUpdate(
      warehouseReceiptId,
      { status: data.status },
      { new: true },
    );
  }

  remove(id: number) {
    return `This action removes a #${id} warehouseReceipt`;
  }
}
