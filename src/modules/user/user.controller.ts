import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("staff/create")
  async createStaff(@Body() userData: CreateUserDto){
    return await this.userService.create(userData);
  }
}
