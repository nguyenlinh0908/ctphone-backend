import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Account } from 'src/modules/auth/model';
import { DeliveryAddressTypeEnum } from '../enum';

export type DeliveryAddressDocument = DeliveryAddress & Document;

@Schema({collection:"deliveryAddresses"})
export class DeliveryAddress {
  @Prop({ type: Types.ObjectId, ref: Account.name })
  accountId: Types.ObjectId;

  @Prop({ type: String })
  fullName: string;

  @Prop({ type: String })
  provinceId: string;

  @Prop({ type: String })
  province: string;

  @Prop({ type: String })
  districtId: string;

  @Prop({ type: String })
  district: string;

  @Prop({ type: String })
  wardId: string;

  @Prop({ type: String })
  ward: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: Boolean })
  isDefault: boolean;

  @Prop({ type: String })
  type: DeliveryAddressTypeEnum;
}

export const DeliveryAddressSchema =
  SchemaFactory.createForClass(DeliveryAddress);
