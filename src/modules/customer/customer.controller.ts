import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateCustomerDto } from './dto';
import { CustomerService } from './customer.service';

@Controller('customer')
export class CustomerController {
  constructor(private readonly userService: CustomerService) {}

  @Post()
  create(@Body() data: CreateCustomerDto) {
    return this.userService.create(data)
  }

  @Get("all")
  findAll(){
    return this.userService.findAll()
  }
}
