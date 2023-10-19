import { Module, ValidationPipe } from '@nestjs/common';
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
import { CategoryModule } from './modules/category/category.module';
import { APP_PIPE } from '@nestjs/core';
import { ProductModule } from './modules/product/product.module';
import { WarehouseReceiptModule } from './modules/warehouse_receipt/warehouse_receipt.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';

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
    StaffModule,
    CategoryModule,
    ProductModule,
    WarehouseReceiptModule,
    OrderModule,
    PaymentModule
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    AppService,
  ],
})
export class AppModule {}
