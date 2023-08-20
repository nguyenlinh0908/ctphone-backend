import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import {default as appEnv, default as config} from "@configs/env.config"
import { dbModule } from '@configs/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config]
    }),
    // dbModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
