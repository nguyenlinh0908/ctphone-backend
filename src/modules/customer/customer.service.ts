import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './model';
import { CreateCustomerDto } from './dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name)
    private readonly userModel: Model<CustomerDocument>,
  ) {}

  findById(userId: string): Promise<Customer> {
    return this.userModel.findById(userId);
  }

  create(userData: CreateCustomerDto): Promise<Customer> {
    return this.userModel.create(userData);
  }

  findAll(){
    return this.userModel.find()
  }
}
