import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WarehouseReceiptStatus } from '../enum';
import { Account } from 'src/modules/auth/model';

export type WarehouseReceiptDocument = WarehouseReceipt & Document;

@Schema({ collection: 'warehouseReceipts' })
export class WarehouseReceipt {
  @Prop({ type: String })
  delivererName: string;

  @Prop({ type: Date })
  deliveryDate: Date;

  @Prop({
    type: String,
    enum: WarehouseReceiptStatus,
    default: WarehouseReceiptStatus.PENDING,
  })
  status: WarehouseReceiptStatus;

  @Prop({ type: String, required: false })
  note?: string;

  @Prop({ type: Number, default: 0 })
  totalQuantity: number;

  @Prop({ type: Number, default: 0 })
  totalAmount: number;

  @Prop({ type: Types.ObjectId, required: true, ref: Account.name })
  accountId: Types.ObjectId;
}

export const WarehouseReceiptSchema =
  SchemaFactory.createForClass(WarehouseReceipt);
