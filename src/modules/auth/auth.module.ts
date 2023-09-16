import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Account,
  AccountRole,
  AccountRoleSchema,
  AccountSchema,
  Role,
  RoleSchema,
} from './model';
import { LoginValidatePipe, RegisterAccountValidatePipe } from './pipe';
import { JwtModule } from '@nestjs/jwt';
import { CustomerModule } from '../customer/customer.module';
import { StaffModule } from '../staff/staff.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: Role.name, schema: RoleSchema },
      { name: AccountRole.name, schema: AccountRoleSchema },
    ]),
    JwtModule,
    CustomerModule,
    StaffModule
  ],
  controllers: [AuthController],
  providers: [AuthService, LoginValidatePipe, RegisterAccountValidatePipe],
})
export class AuthModule {}
