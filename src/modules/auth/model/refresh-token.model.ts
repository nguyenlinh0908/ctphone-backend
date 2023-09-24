import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RefreshTokenDocument = RefreshToken & Document;

@Schema({ collection: 'refreshTokens' })
export class RefreshToken {
  @Prop()
  token: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
