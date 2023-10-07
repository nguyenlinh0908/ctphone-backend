import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OrderStatus } from '../enum';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  ownerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false })
  merchandiserId?: Types.ObjectId;

  @Prop({ type: String })
  code: string;

  @Prop({ type: Number })
  totalQuantity: number;

  @Prop({ type: Number })
  totalAmount: number;

  @Prop({ type: String, required: false })
  note?: string;

  @Prop({ type: String, default: OrderStatus.CART })
  status: OrderStatus;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
