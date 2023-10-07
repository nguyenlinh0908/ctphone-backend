import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Order } from './order.model';
import { Product } from 'src/modules/product/models';

export type OrderDetailDocument = OrderDetail & Document;

@Schema()
export class OrderDetail {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Order.name })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Product.name })
  productId: Types.ObjectId;

  @Prop({ type: Number })
  quantity: number;

  @Prop({ type: Number })
  amount: number;
}

export const OrderDetailSchema = SchemaFactory.createForClass(OrderDetail);
