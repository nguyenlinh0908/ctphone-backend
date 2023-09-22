import { IsEnum, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { AccountType } from '../enum';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsMongoId()
  userId: string;

  @IsString()
  @IsNotEmpty()
  roleId: string;

  @IsEnum(AccountType)
  accountType: AccountType;
}
