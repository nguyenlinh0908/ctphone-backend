import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccountRoleDocument = AccountRole & Document;

@Schema({collection: "accountRoles"})
export class AccountRole {
  @Prop({ type: Types.ObjectId })
  accountId: string;

  @Prop({ type: Types.ObjectId })
  roleId: string;
}

export const AccountRoleSchema = SchemaFactory.createForClass(AccountRole);
