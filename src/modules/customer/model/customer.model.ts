import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Gender } from 'src/shared/enum';

export type CustomerDocument = Customer & Document;

@Schema()
export class Customer {
  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: Date, required: true })
  dateOfBirth: Date;

  @Prop({ type: String, required: true })
  gender: Gender;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: false })
  email?: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
