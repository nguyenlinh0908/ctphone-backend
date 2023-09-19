import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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
import { AuthGuard } from './guard';
import { Roles } from './decorator';
import { RoleType } from './enum/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Roles(RoleType.ADMIN)
  @UseGuards(AuthGuard)
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
  login(@Body(LoginValidatePipe) loginData: LoginDto) {
    return this.authService.login(loginData);
  }

  @Roles(RoleType.ADMIN)
  @UseGuards(AuthGuard)
  @Post('role')
  createRole(@Body() data: CreateRoleDto) {
    return this.authService.createRole(data);
  }

  @Roles(RoleType.ADMIN, RoleType.STAFF, RoleType.CUSTOMER)
  @UseGuards(AuthGuard)
  @Post('re-access')
  reAccessToken(@Body() data: ReAccessTokenDto) {
    return this.authService.genAccessToken(data);
  }

  @Roles(RoleType.ADMIN, RoleType.STAFF, RoleType.CUSTOMER)
  @UseGuards(AuthGuard)
  @Post('logout')
  logout(@Body() data: LogoutDto) {
    return this.authService.logout(data);
  }
}
