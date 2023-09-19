import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { envConfig } from '@configs/env.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {cors: {origin: '*', credentials: true}});
  app.setGlobalPrefix(envConfig.URI_PREFIX);
  await app.listen(envConfig.API_PORT || 3000);
  console.log('api is running in ===> ', envConfig.API_PORT);
}
bootstrap();
