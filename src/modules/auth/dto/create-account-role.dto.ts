import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class CreateAccountRole {
  @IsMongoId()
  @IsNotEmpty()
  accountId: Types.ObjectId;

  @IsNotEmpty()
  @IsMongoId()
  roleId: Types.ObjectId;
}
