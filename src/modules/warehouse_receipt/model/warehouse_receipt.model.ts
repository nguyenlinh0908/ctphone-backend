import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WarehouseReceiptDocument = WarehouseReceipt & Document;

@Schema({collection: "warehouseReceipts"})
export class WarehouseReceipt {
  @Prop({ type: String })
  delivererName: string;

  @Prop({ type: String })
  inputDate: string;

  @Prop()
  status: boolean;

  @Prop({ type: String, required: false })
  note?: string;

  @Prop({ type: Number, default: 0 })
  totalQuantity: number;

  @Prop({ type: Number, default: 0 })
  totalAmount: number;

  @Prop({ type: Types.ObjectId, required: true })
  accountId: Types.ObjectId;
}

export const WarehouseReceiptSchema =
  SchemaFactory.createForClass(WarehouseReceipt);
