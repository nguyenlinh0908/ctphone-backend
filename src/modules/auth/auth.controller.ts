import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateAccountDto,
  CreateCustomerAccountDto,
  CreateRoleDto,
  LoginDto,
  LogoutDto,
  ReAccessTokenDto,
} from './dto';
import { LoginValidatePipe } from './pipe';
import { RegisterAccountValidatePipe } from './pipe/register-account-validate.pipe';
import { JwtAuthGuard, RolesGuard } from './guard';
import { CurrentUser, Roles } from './decorator';
import { RoleType } from './enum/role.enum';
import { ResTransformInterceptor } from 'src/shared/interceptor';
import { IJwtPayload } from './interface';
import { ObjectId } from 'mongodb';
import { CustomerService } from '../customer/customer.service';
import { CreateCustomerDto } from '../customer/dto';
import { AccountType } from './enum';
import { hashString } from 'src/utils/auth';
import { I18nService } from 'nestjs-i18n';
import { StaffService } from '../staff/staff.service';

@UseInterceptors(ResTransformInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly customerService: CustomerService,
    private readonly staffService: StaffService,
    private readonly i18nService: I18nService,
  ) {}

  @Roles(RoleType.ADMIN)
  @UseGuards(JwtAuthGuard)
  @Post('staff/account/register')
  async registerStaffAccount(
    @Body(RegisterAccountValidatePipe) data: CreateAccountDto,
  ) {
    try {
      const account = await this.authService.registerAccount(data);
      this.authService.createAccountRole({
        accountId: new ObjectId(account._id),
        roleId: new ObjectId(data.roleId),
      });
      return account;
    } catch (error) {}
  }

  @Post('customer/account/register')
  async registerCustomerAccount(@Body() data: CreateCustomerAccountDto) {
    const customerInput: CreateCustomerDto = {
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      phone: data.phone,
      address: data.address,
    };
    const customerExisted = await this.customerService.findOneByPhone(
      data.phone,
    );
    if (customerExisted)
      throw new HttpException(
        this.i18nService.t('customer.ERROR.PHONE_EXISTED'),
        HttpStatus.BAD_REQUEST,
      );

    const accountExisted = await this.authService.findByUsername(data.username);
    if (accountExisted)
      throw new HttpException(
        this.i18nService.t('auth.ERROR.USERNAME_EXISTED'),
        HttpStatus.BAD_REQUEST,
      );

    const customer = await this.customerService.create(customerInput);
    if (customer) {
      const customerRole = await this.authService.findOneRoles({
        code: 'CUSTOMER',
      });
      const accountInput: CreateAccountDto = {
        username: data.username,
        password: hashString(data.password),
        userId: customer._id,
        roleId: customerRole._id,
        accountType: AccountType.CUSTOMER,
      };
      const account = await this.authService.registerAccount(accountInput);

      this.authService.createAccountRole({
        accountId: account._id,
        roleId: customerRole._id,
      });
      return account;
    }
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
  @Post('gen-access')
  reAccessToken(@Body() data: ReAccessTokenDto) {
    return this.authService.genAccessToken(data);
  }

  @Roles(RoleType.ADMIN, RoleType.STAFF, RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Body() data: LogoutDto) {
    return this.authService.logout(data);
  }

  @Roles(RoleType.ADMIN, RoleType.STAFF, RoleType.CUSTOMER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('profile')
  async profile(@CurrentUser() currentUser: IJwtPayload) {
    if (currentUser.type == AccountType.CUSTOMER)
      return this.authService.findByIdPopulateByCustomer(currentUser._id);
    return this.authService.findByIdPopulateByStaff(currentUser._id);
  }
}
