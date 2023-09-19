import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Account,
  AccountRole,
  AccountRoleSchema,
  AccountSchema,
  RefreshToken,
  RefreshTokenSchema,
  Role,
  RoleSchema,
} from './model';
import { LoginValidatePipe, RegisterAccountValidatePipe } from './pipe';
import { JwtModule } from '@nestjs/jwt';
import { CustomerModule } from '../customer/customer.module';
import { StaffModule } from '../staff/staff.module';
import { RedisCachingModule } from 'src/shared/modules/redis-cache/redis-caching.module';
import { JwtStrategy } from './strategies';
import { JwtAuthGuard, RolesGuard } from './guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Role.name, schema: RoleSchema },
      { name: AccountRole.name, schema: AccountRoleSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
    JwtModule,
    CustomerModule,
    StaffModule,
    RedisCachingModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LoginValidatePipe,
    RegisterAccountValidatePipe,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
