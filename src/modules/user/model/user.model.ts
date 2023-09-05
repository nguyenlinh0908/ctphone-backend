import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Gender, Role } from 'src/modules/shared/enum';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: Date, required: true })
  dateOfBirth: Date;

  @Prop({ type: String, required: true })
  gender: Gender;

  @Prop({ type: String, required: true })
  phoneNumber: string;

  @Prop({ type: String, required: false })
  email?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
