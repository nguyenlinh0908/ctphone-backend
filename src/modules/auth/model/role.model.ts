import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type RoleDocument = Role & Document

@Schema()
export class Role {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  code: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role)
