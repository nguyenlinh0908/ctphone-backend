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
    return this.deliveryAddressModel.find(filter).sort("-isDefault");
  }

  findOne(filter: FilterDeliveryAddress) {
    return this.deliveryAddressModel.findOne(filter);
  }

  findByAccountId(accountId: Types.ObjectId) {
    return this.deliveryAddressModel.find({
      accountId: new ObjectId(accountId),
    }).sort("-isDefault");;
  }

  updateOneById(id: Types.ObjectId, data: UpdateDeliveryAddressDto) {
    return this.deliveryAddressModel.findByIdAndUpdate(id, data, { new: true });
  }

  updateDefaultToNormal(accountId: Types.ObjectId) {
    return this.deliveryAddressModel.updateMany(
      { accountId: accountId, isDefault: true },
      { $set: { isDefault: false } },
    );
  }

  delete(id: string) {
    return this.deliveryAddressModel.deleteOne({ _id: new ObjectId(id) });
  }
}
