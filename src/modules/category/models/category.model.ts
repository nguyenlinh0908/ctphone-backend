import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema()
export class Category {
  @Prop({ type: String })
  name: string;

  @Prop({ type: Number, min: 0, default: 0 })
  left: number;

  @Prop({ type: Number, min: 0, default: 1 })
  right: number;

  @Prop({ type: Number, min: 0, default: 0 })
  dept: number;

  @Prop({ type: Types.ObjectId, required: false, ref: Category.name })
  parentId?: Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
