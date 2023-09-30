import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ collection: 'refreshTokens' })
export class RefreshToken {
  @Prop()
  token: string;

  @Prop()
  expiredAt: Date
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
