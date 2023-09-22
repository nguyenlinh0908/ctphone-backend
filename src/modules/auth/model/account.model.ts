import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AccountType } from '../enum';

export type AccountDocument = Account & Document;

@Schema()
export class Account {
  _id: Types.ObjectId;

  @Prop({ type: String, unique: true })
  username: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: Types.ObjectId })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: AccountType, default: AccountType.CUSTOMER })
  accountType: AccountType;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
