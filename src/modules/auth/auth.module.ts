import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '@modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, AccountSchema } from './model';
import { LoginValidatePipe } from './pipe';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    JwtModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LoginValidatePipe],
})
export class AuthModule {}
