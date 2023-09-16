import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Customer } from 'src/modules/customer/model';

export type AccountDocument = Account & Document;

@Schema()
export class Account {
  _id: Types.ObjectId;

  @Prop({ type: String, unique: true })
  username: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: Types.ObjectId, required: false })
  customerId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: false })
  staffId?: Types.ObjectId;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
