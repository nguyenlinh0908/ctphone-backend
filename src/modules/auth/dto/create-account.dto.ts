import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { AccountType } from '../enum';
import { Types } from 'mongoose';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  roleId: Types.ObjectId;

  @IsEnum(AccountType)
  accountType: AccountType;
}
