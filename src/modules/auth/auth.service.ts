import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account, AccountDocument, Role, RoleDocument } from './model';
import { Model } from 'mongoose';
import { CreateAccountDto, CreateRoleDto, LoginDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import { IJWT, IJwtPayload } from './interface';
import { JwtType } from './enum';
import appEnv from '@configs/env.config';
import * as ms from 'ms';
import * as dayjs from 'dayjs';
import { CustomerService } from '../customer/customer.service';
import { StaffService } from '../staff/staff.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    private jwtService: JwtService,
    private customerService: CustomerService,
    private staffService: StaffService,
  ) {}

  async registerStaffAccount(accountData: CreateAccountDto): Promise<Account> {
    const accountCreated = await this.accountModel.create(accountData);
    return accountCreated;
  }

  async registerCustomerAccount() {
    return this.accountModel.create();
  }

  async login(loginData: LoginDto): Promise<IJWT> {
    const user = await this.accountModel.findOne({
      username: loginData.username,
    });

    const payload: IJwtPayload = {
      _id: user._id,
      username: user.username,
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

  getAllRoles(): Promise<Role[]> {
    return this.roleModel.find();
  }

  async createRole(data: CreateRoleDto) {
    return this.roleModel.create(data);
  }
}
