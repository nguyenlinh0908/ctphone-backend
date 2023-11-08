import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop({ type: String })
  name: string;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: String, required: true })
  sku: string;

  @Prop({ type: String })
  colorName: string;

  @Prop({ type: String })
  colorCode: string;

  @Prop({ type: Number })
  ram: number;

  @Prop({ type: String })
  ramUnit: string;

  @Prop({ type: Number })
  rom: number;

  @Prop({ type: String })
  romUnit: string;

  @Prop({ type: Boolean, default: false })
  enable: boolean;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Types.ObjectId })
  categoryId: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  quantity: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
