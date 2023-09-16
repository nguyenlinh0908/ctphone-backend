import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAccountRole {
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @IsNotEmpty()
  @IsString()
  roleId: string;
}
