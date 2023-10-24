import { IsNotEmpty, IsString } from 'class-validator';
import { CreateCustomerDto } from 'src/modules/customer/dto';

export class CreateCustomerAccountDto extends CreateCustomerDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
