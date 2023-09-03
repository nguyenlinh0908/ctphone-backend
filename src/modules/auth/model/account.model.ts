import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Role } from 'src/modules/shared/enum';

export type AccountDocument = Account & Document

@Schema()
export class Account {
  @Prop({ type: String })
  username: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String })
  type: Role;

  @Prop({ type: String })
  ownerId: string;
}

export const AccountSchema = SchemaFactory.createForClass(Account)