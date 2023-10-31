import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MediaType } from '../enum';
import { Document, Types } from 'mongoose';

export type MediaDocument = Media & Document;

@Schema({ timestamps: true })
export class Media {
  @Prop({ type: String })
  url: string;

  @Prop({ type: String })
  type: MediaType;

  @Prop({ type: Types.ObjectId, required: false })
  ownerId?: Types.ObjectId;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
