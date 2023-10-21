import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccountRoleDocument = AccountRole & Document;

@Schema({ collection: 'accountRoles' })
export class AccountRole {
  @Prop({ type: Types.ObjectId })
  accountId: Types.ObjectId;

  @Prop({ type: Types.ObjectId })
  roleId: Types.ObjectId;
}

export const AccountRoleSchema = SchemaFactory.createForClass(AccountRole);
