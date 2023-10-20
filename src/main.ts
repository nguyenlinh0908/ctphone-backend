import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envConfig } from '@configs/env.config';
import { ValidationPipeCustom } from './pipes/validation.pipe';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {cors: {origin: '*', credentials: true}});
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.setGlobalPrefix(envConfig.URI_PREFIX);
  await app.listen(envConfig.API_PORT || 3000);
  app.useGlobalPipes(new ValidationPipeCustom());
  console.log('api is running in ===> ', envConfig.API_PORT);
}
bootstrap();
