import { Body, Controller, Get, Post, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { hashString } from 'src/utils/auth';
import { CreateAccountDto, CreateRoleDto, LoginDto } from './dto';
import { I18nService } from 'nestjs-i18n';
import { LoginValidatePipe } from './pipe';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private i18n: I18nService,
  ) {}

  @Post('staff/account/register')
  async registerStaffAccount(@Body() accountData: CreateAccountDto) {
    accountData.password = hashString(accountData.password);
    return await this.authService.registerStaffAccount(accountData);
  }

  @Post('login')
  async login(@Body(LoginValidatePipe) loginData: LoginDto) {
    return await this.authService.login(loginData);
  }

  @Post("role")
  createRole(@Body() data: CreateRoleDto){
    return this.authService.createRole(data)
  }
}
