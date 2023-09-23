import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Account,
  AccountDocument,
  AccountRole,
  AccountRoleDocument,
  RefreshToken,
  RefreshTokenDocument,
  Role,
  RoleDocument,
} from './model';
import { Model } from 'mongoose';
import {
  CreateAccountDto,
  CreateAccountRole,
  CreateRoleDto,
  LoginDto,
  LogoutDto,
  ReAccessTokenDto,
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
import { I18nService } from 'nestjs-i18n';
import { RedisCachingService } from 'src/shared/modules/redis-cache/redis-caching.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(AccountRole.name)
    private accountRoleModel: Model<AccountRoleDocument>,
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    private jwtService: JwtService,
    private customerService: CustomerService,
    private staffService: StaffService,
    private readonly i18nService: I18nService,
    private redisCachingService: RedisCachingService,
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

    const accountRoles = await this.findAccountRolesByAccountId(
      account._id.toString(),
    );
    const userRoleIds = _.map(accountRoles, (item) => item.roleId);

    const userRoles = await this.findRolesByIds(userRoleIds);
    const userRoleCodes = _.map(userRoles, (i) => i.code);

    const payload: IJwtPayload = {
      _id: account._id,
      username: account.username,
      roles: userRoleCodes,
      type: account.accountType
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
      me: payload,
    };
    return jwtToken;
  }

  async findById(accountId: string) {
    return await this.accountModel.findById(accountId);
  }

  async findByUsername(username: string): Promise<Account> {
    return await this.accountModel.findOne({ username });
  }

  findByUserId(userId: string) {
    return this.accountModel.find({ userId });
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

  findRolesByIds(ids: string) {
    return this.roleModel.find({ _id: { $in: ids } });
  }

  findRoleById(id: string) {
    return this.roleModel.findById(id);
  }

  createAccountRole(data: CreateAccountRole) {
    return this.accountRoleModel.create(data);
  }

  genAccessToken(data: ReAccessTokenDto) {
    const tokenVerified = this.verifyJwt(data.refreshToken);
    if (!tokenVerified)
      throw new HttpException(
        this.i18nService.t('auth.ERROR.TOKEN_INVALID'),
        HttpStatus.BAD_REQUEST,
      );
    return this.signJwt({ ...tokenVerified }, JwtType.ACCESS_TOKEN);
  }

  async logout(data: LogoutDto): Promise<boolean> {
    const tokenVerified = this.verifyJwt(data.refreshToken);

    if (!tokenVerified)
      throw new HttpException(
        this.i18nService.t('auth.ERROR.TOKEN_INVALID'),
        HttpStatus.BAD_REQUEST,
      );

    //caching accessToken expired it when logout still using token to login
    await this.redisCachingService.set({
      key: data.accessToken,
      value: true,
      ttl: +appEnv().jwt.JWT_TOKEN_EXPIRE_IN,
    });

    return !!this.createRefreshToken(data.refreshToken);
  }

  createRefreshToken(token: string): Promise<RefreshToken> {
    const data: RefreshToken = {
      token,
    };
    return this.refreshTokenModel.create(data);
  }

  getRefreshToken(token: string): Promise<RefreshToken> {
    return this.refreshTokenModel.findOne({ token });
  }

  async isAccessTokenLoggedOut(accessToken: string): Promise<boolean> {
    return !!(await this.redisCachingService.get(accessToken));
  }
}
