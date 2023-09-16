import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAccountDto, CreateRoleDto, LoginDto } from './dto';
import { LoginValidatePipe } from './pipe';
import { RegisterAccountValidatePipe } from './pipe/register-account-validate.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('staff/account')
  async registerStaffAccount(
    @Body(RegisterAccountValidatePipe) data: CreateAccountDto,
  ) {
    try {
      const account = await this.authService.registerAccount(data);
      this.authService.createAccountRole({
        accountId: account._id.toString(),
        roleId: data.roleId,
      });
      return account;
    } catch (error) {}
  }

  @Post('login')
  async login(@Body(LoginValidatePipe) loginData: LoginDto) {
    return await this.authService.login(loginData);
  }

  @Post('role')
  createRole(@Body() data: CreateRoleDto) {
    return this.authService.createRole(data);
  }
}
