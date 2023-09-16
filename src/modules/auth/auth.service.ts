import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Account,
  AccountDocument,
  AccountRole,
  AccountRoleDocument,
  Role,
  RoleDocument,
} from './model';
import { Model } from 'mongoose';
import {
  CreateAccountDto,
  CreateAccountRole,
  CreateRoleDto,
  LoginDto,
} from './dto';
import { JwtService } from '@nestjs/jwt';
import { IJWT, IJwtPayload } from './interface';
import { JwtType } from './enum';
import appEnv from '@configs/env.config';
import * as ms from 'ms';
import * as dayjs from 'dayjs';
import { CustomerService } from '../customer/customer.service';
import { StaffService } from '../staff/staff.service';
import * as _ from 'lodash';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(AccountRole.name)
    private accountRoleModel: Model<AccountRoleDocument>,
    private jwtService: JwtService,
    private customerService: CustomerService,
    private staffService: StaffService,
  ) {}

  async registerAccount(accountData: CreateAccountDto): Promise<Account> {
    const accountCreated = await this.accountModel.create(accountData);
    return accountCreated;
  }

  async registerCustomerAccount() {
    return this.accountModel.create();
  }

  async login(loginData: LoginDto): Promise<IJWT> {
    const account = await this.accountModel.findOne({
      username: loginData.username,
    });

    const userRoles = await this.findAccountRolesByAccountId(
      account._id.toString(),
    );
    const userRoleIds = _.map(userRoles, (item) => item.roleId);

    const payload: IJwtPayload = {
      _id: account._id,
      username: account.username,
      role: userRoleIds,
    };

    const accessToken = this.signJwt(payload, JwtType.ACCESS_TOKEN);
    const refreshToken = this.signJwt(payload, JwtType.REFRESH_TOKEN);

    const currentTimestamp = dayjs().valueOf();
    const accessTokenExpiresIn =
      currentTimestamp + ms(appEnv().jwt.JWT_TOKEN_EXPIRE_IN);
    const refreshTokenExpiresIn =
      currentTimestamp + ms(appEnv().jwt.JWT_REFRESH_TOKEN_EXPIRE_IN);

    const jwtToken: IJWT = {
      accessToken,
      refreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    };
    return jwtToken;
  }

  async findById(accountId: string) {
    return await this.accountModel.findById(accountId);
  }

  async findByUsername(username: string): Promise<Account> {
    return await this.accountModel.findOne({ username });
  }

  findByStaffId(staffId: string) {
    return this.accountModel.find({ staffId });
  }

  findByCustomerId(customerId: string) {
    return this.accountModel.find({ customerId });
  }

  signJwt(payload: IJwtPayload, jwtType: JwtType) {
    const expiresIn =
      jwtType == JwtType.ACCESS_TOKEN
        ? appEnv().jwt.JWT_TOKEN_EXPIRE_IN
        : appEnv().jwt.JWT_REFRESH_TOKEN_EXPIRE_IN;

    return this.jwtService.sign(payload, {
      privateKey: appEnv().jwt.AUTH_JWT_SECRET,
      expiresIn,
    });
  }

  verifyJwt(token: string) {
    return this.jwtService.verify<IJwtPayload>(token, {
      secret: appEnv().jwt.AUTH_JWT_SECRET,
    });
  }

  getAllRoles(): Promise<Role[]> {
    return this.roleModel.find();
  }

  createRole(data: CreateRoleDto) {
    return this.roleModel.create(data);
  }

  findAccountRolesByAccountId(accountId: string) {
    return this.accountRoleModel.find({ accountId });
  }

  findRoleById(id: string) {
    return this.roleModel.findById(id);
  }

  findRoleByIds(ids: string[]) {
    return this.roleModel.find({ _id: { $in: ids } });
  }

  createAccountRole(data: CreateAccountRole) {
    return this.accountRoleModel.create(data);
  }
}
