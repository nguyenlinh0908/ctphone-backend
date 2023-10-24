import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Gender } from 'src/shared/enum';

export type CustomerDocument = Customer & Document;

@Schema()
export class Customer {
  _id?: Types.ObjectId;

  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: Date, required: true })
  dateOfBirth: Date;

  @Prop({ type: String, required: true })
  gender: Gender;

  @Prop({ type: String, required: true, unique:true })
  phone: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: false })
  email?: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
