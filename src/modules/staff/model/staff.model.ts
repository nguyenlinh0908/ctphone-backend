import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Gender } from 'src/shared/enum';

export type StaffDocument = Staff & Document;

@Schema()
export class Staff {
  @Prop({ type: String, required: true })
  fullName: string;

  @Prop({ type: String, required: true })
  gender: Gender;

  @Prop({ type: Date, required: true })
  dateOfBirth: Date;

  @Prop({ type: String, required: true, unique: true })
  phone: string;

  @Prop({ type: String, required: false })
  email?: string;

  @Prop({ type: String, required: true, unique: true })
  citizenId: string;

  @Prop({ type: String, required: true })
  address: string;
}

export const StaffSchema = SchemaFactory.createForClass(Staff);
