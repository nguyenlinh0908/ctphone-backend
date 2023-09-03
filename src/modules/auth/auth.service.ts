import { Injectable } from '@nestjs/common';
import { UserService } from '@modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async registerStaffAccount(staffId: string) {
    const staff = await this.userService.findById(staffId)
  }
}
