import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/modules/shared/enum';

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  ownerId: string;

  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
