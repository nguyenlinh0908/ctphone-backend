import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop()
  userId: Types.ObjectId;

  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  content: string;

  @Prop({ type: Boolean, default: false })
  seen: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
