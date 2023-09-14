import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { default as appEnv, default as config } from '@configs/env.config';
import { dbModule } from '@configs/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { I18nModule, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';
import { CustomerModule } from './modules/customer/customer.module';
import { StaffModule } from './modules/staff/staff.module';

@Module({
  imports: [
    /**Base config */
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    dbModule,
    /**I18n */
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang', 'locale', 'l'] }],
    }),
    /**Modules */
    AuthModule,
    CustomerModule,
    StaffModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
