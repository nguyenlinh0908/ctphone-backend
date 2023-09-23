import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateAccountDto,
  CreateRoleDto,
  LoginDto,
  LogoutDto,
  ReAccessTokenDto,
} from './dto';
import { LoginValidatePipe } from './pipe';
import { RegisterAccountValidatePipe } from './pipe/register-account-validate.pipe';
import { JwtAuthGuard, RolesGuard } from './guard';
import { Roles } from './decorator';
import { RoleType } from './enum/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Roles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Post('staff/account/register')
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

  @Post('customer/account/register')
  async registerCustomerAccount(
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
  login(@Body(LoginValidatePipe) loginData: LoginDto) {
    return this.authService.login(loginData);
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Post('role')
  createRole(@Body() data: CreateRoleDto) {
    return this.authService.createRole(data);
  }

  @Roles(RoleType.ADMIN, RoleType.STAFF, RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard)
  @Post('re-access')
  reAccessToken(@Body() data: ReAccessTokenDto) {
    return this.authService.genAccessToken(data);
  }

  @Roles(RoleType.ADMIN, RoleType.STAFF, RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Body() data: LogoutDto) {
    return this.authService.logout(data);
  }
}
