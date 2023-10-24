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
import { Model, Types } from 'mongoose';
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
import { ObjectId } from 'mongodb';

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
    return this.accountModel.create({
      ...accountData,
      userId: new ObjectId(accountData.userId),
    });
  }

  async registerCustomerAccount() {
    return this.accountModel.create();
  }

  async login(loginData: LoginDto): Promise<IJWT> {
    const account = await this.accountModel.findOne({
      username: loginData.username,
    });

    const accountRoles = await this.findAccountRolesByAccountId(account._id);
    const userRoleIds = _.map(accountRoles, (item) => item.roleId);
    const userRoles = await this.findRolesByIds(userRoleIds);
    const userRoleCodes = _.map(userRoles, (i) => i.code);

    const payload: IJwtPayload = {
      _id: account._id,
      username: account.username,
      roles: userRoleCodes,
      type: account.accountType,
    };

    const accessToken = this.signJwt(payload, JwtType.ACCESS_TOKEN);
    const refreshToken = this.signJwt(payload, JwtType.REFRESH_TOKEN);

    const currentTimestamp = new Date().getTime();
    const accessTokenExpiresAt =
      currentTimestamp + ms(appEnv().jwt.JWT_TOKEN_EXPIRE_IN);
    const refreshTokenExpiresAt =
      currentTimestamp + ms(appEnv().jwt.JWT_REFRESH_TOKEN_EXPIRE_IN);

    const refreshTokenExpireAt = new Date(refreshTokenExpiresAt);
    this.createRefreshToken(refreshToken, refreshTokenExpireAt);

    const jwtToken: IJWT = {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
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

  findAccountRolesByAccountId(
    accountId: Types.ObjectId,
  ): Promise<AccountRole[]> {
    return this.accountRoleModel.find({ accountId });
  }

  findRolesByIds(ids: Types.ObjectId[]) {
    return this.roleModel.find({ _id: { $in: ids } });
  }

  findRoleById(id: Types.ObjectId) {
    return this.roleModel.findById(id);
  }

  findOneRoles(filter: any): Promise<Role> {
    return this.roleModel.findOne(filter);
  }
  
  createAccountRole(data: CreateAccountRole) {
    return this.accountRoleModel.create(data);
  }

  async genAccessToken(data: ReAccessTokenDto): Promise<IJWT> {
    const tokenExisted = await this.getRefreshToken({
      token: data.refreshToken,
      expiredAt: { $gt: new Date() },
    });

    if (!tokenExisted)
      throw new HttpException(
        this.i18nService.t('auth.ERROR.INVALID_TOKEN'),
        HttpStatus.BAD_REQUEST,
      );
    const tokenVerified = this.verifyJwt(data.refreshToken);
    delete tokenVerified.exp;
    delete tokenVerified.iat;

    const accessToken = this.signJwt(
      { ...tokenVerified },
      JwtType.ACCESS_TOKEN,
    );
    const refreshToken = this.signJwt(tokenVerified, JwtType.REFRESH_TOKEN);

    const currentTimestamp = new Date().getTime();
    const accessTokenExpiresAt =
      currentTimestamp + ms(appEnv().jwt.JWT_TOKEN_EXPIRE_IN);
    const refreshTokenExpiresAt =
      currentTimestamp + ms(appEnv().jwt.JWT_REFRESH_TOKEN_EXPIRE_IN);

    await this.deleteRefreshToken(data.refreshToken);
    this.createRefreshToken(refreshToken, refreshTokenExpiresAt);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      me: tokenVerified,
    };
  }

  async logout(data: LogoutDto): Promise<boolean> {
    const tokenVerified = this.verifyJwt(data.refreshToken);
    //caching accessToken expired it when logout still using token to login
    await this.redisCachingService.set({
      key: data.accessToken,
      value: true,
      ttl: ms(appEnv().jwt.JWT_TOKEN_EXPIRE_IN),
    });

    if (!tokenVerified) return true;
    this.deleteRefreshToken(data.refreshToken);
    return true;
  }

  createRefreshToken(token: string, expiredAt: Date): Promise<RefreshToken> {
    const data: RefreshToken = {
      token,
      expiredAt,
    };
    return this.refreshTokenModel.create(data);
  }

  deleteRefreshToken(token: string) {
    return this.refreshTokenModel.deleteOne({ token });
  }

  getRefreshToken(filter: any): Promise<RefreshToken> {
    return this.refreshTokenModel.findOne({ ...filter });
  }

  async isAccessTokenLoggedOut(accessToken: string): Promise<boolean> {
    return !!(await this.redisCachingService.get(accessToken));
  }
}
