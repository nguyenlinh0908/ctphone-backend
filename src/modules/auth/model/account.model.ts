import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { Role } from 'src/modules/shared/enum';
import { User } from 'src/modules/user/model';

export type AccountDocument = Account & Document;

@Schema()
export class Account {
  @Prop({ type: String, unique: true })
  username: string;

  @Prop({ type: String })
  password: string;

  @Prop({ type: String })
  role: Role;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  ownerId: Types.ObjectId;
}

export const AccountSchema = SchemaFactory.createForClass(Account);
