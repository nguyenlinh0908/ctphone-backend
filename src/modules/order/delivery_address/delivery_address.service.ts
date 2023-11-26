import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DeliveryAddress, DeliveryAddressDocument } from './model';
import { FilterDeliveryAddress, UpdateDeliveryAddressDto } from './dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class DeliveryAddressService {
  constructor(
    @InjectModel(DeliveryAddress.name)
    private deliveryAddressModel: Model<DeliveryAddressDocument>,
  ) {}

  create(data: DeliveryAddress) {
    return this.deliveryAddressModel.create(data);
  }

  find(filter: FilterDeliveryAddress) {
    return this.deliveryAddressModel.find(filter);
  }

  findOne(filter: FilterDeliveryAddress) {
    return this.deliveryAddressModel.findOne(filter);
  }

  findByAccountId(accountId: Types.ObjectId) {
    return this.deliveryAddressModel.find({
      accountId: new ObjectId(accountId),
    });
  }

  updateOne(id: Types.ObjectId, data: UpdateDeliveryAddressDto) {
    console.log('id :>> ', id);
    console.log('data :>> ', data);
    return this.deliveryAddressModel.findByIdAndUpdate(id, data, { new: true });
  }

  delete(id: string) {
    return this.deliveryAddressModel.deleteOne({ _id: new ObjectId(id) });
  }
}
