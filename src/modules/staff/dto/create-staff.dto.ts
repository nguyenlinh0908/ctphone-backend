import { Transform } from 'class-transformer';
import { IsDate, IsEmail, IsEmpty, IsEnum, IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator';
import { Gender } from 'src/shared/enum';

export class CreateStaffDto {
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  @Transform(value => (value as unknown as Date).toISOString(), {
    toPlainOnly: true
  })
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
