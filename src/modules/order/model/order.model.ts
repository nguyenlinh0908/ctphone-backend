import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OrderStatus, PaymentStatus } from '../enum';
import { Document, Types } from 'mongoose';
import { Account } from 'src/modules/auth/model';
import { AccountType } from 'src/modules/auth/enum';
import { DeliveryAddress } from 'src/modules/delivery_address/model';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Account.name })
  ownerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false, ref: Account.name })
  merchandiserId?: Types.ObjectId;

  @Prop({ type: String })
  code: string;

  @Prop({ type: Number, default: 0 })
  totalQuantity: number;

  @Prop({ type: Number, default: 0 })
  totalAmountBeforeDiscount: number;

  @Prop({ type: Number, default: 0 })
  totalAmountAfterDiscount: number;

  @Prop({ type: String, required: false })
  note?: string;

  @Prop({ type: String, default: OrderStatus.CART })
  status: OrderStatus;

  @Prop({ type: String, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Prop({ type: DeliveryAddress, required: false })
  deliveryAddress?: DeliveryAddress;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
