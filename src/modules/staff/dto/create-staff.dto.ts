import { IsDate, IsEmail, IsEmpty, IsEnum, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { Gender } from 'src/shared/enum';

export class CreateStaffDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsDate()
  dateOfBirth: Date;

  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @IsNotEmpty()
  @IsPhoneNumber('VN')
  phone: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsString()
  citizenId: string;
}
