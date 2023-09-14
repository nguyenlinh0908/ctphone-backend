import { Body, Controller, Post } from '@nestjs/common';
import { CreateCustomerDto } from './dto';
import { CustomerService } from './customer.service';

@Controller('customer')
export class CustomerController {
  constructor(private readonly userService: CustomerService) {}

}
