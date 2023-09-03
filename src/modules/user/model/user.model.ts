import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Gender, Role } from 'src/modules/shared/enum';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ type: String })
  fullName: string;

  @Prop({ type: Date })
  dateOfBirth: Date;

  @Prop({ type: String })
  gender: Gender;

  @Prop({ type: String })
  phoneNumber: string;

  @Prop({ type: String, required: false })
  email?: string;

  @Prop({ type: String })
  role: Role;
}

export const UserSchema = SchemaFactory.createForClass(User);
