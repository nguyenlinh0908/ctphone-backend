import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './model';
import { CreateCustomerDto } from './dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private readonly userModel: Model<CustomerDocument>,
  ) {}

  async findById(userId: string): Promise<Customer> {
    return await this.userModel.findById(userId);
  }

  async create(userData: CreateCustomerDto): Promise<Customer> {
    return await this.userModel.create(userData);
  }
}
