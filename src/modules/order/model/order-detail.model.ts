import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type OrderDetailDocument = OrderDetail & Document;

@Schema()
export class OrderDetail {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  productId: Types.ObjectId;

  @Prop({ type: Number })
  quantity: number;

  @Prop({ type: Number })
  amount: number;
}

export const OrderDetailSchema = SchemaFactory.createForClass(OrderDetail);
