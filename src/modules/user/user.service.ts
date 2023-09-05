import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './model';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(userId: string): Promise<User> {
    return await this.userModel.findById(userId);
  }

  async create(userData: CreateUserDto): Promise<User> {
    return await this.userModel.create(userData);
  }
}
