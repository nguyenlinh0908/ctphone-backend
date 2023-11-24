import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WarehouseReceiptDetailDocument = WarehouseReceiptDetail & Document;

@Schema({ collection: 'warehouseReceiptDetails' })
export class WarehouseReceiptDetail {
  @Prop({ type: Types.ObjectId })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  warehouseReceiptId: Types.ObjectId;

  @Prop({ type: Number })
  quantity: number;

  @Prop({ type: Number })
  amount: number;

  @Prop({ type: Number })
  amountUnit: number;
}

export const WarehouseReceiptDetailSchema = SchemaFactory.createForClass(
  WarehouseReceiptDetail,
);
