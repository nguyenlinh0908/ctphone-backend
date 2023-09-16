import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { envConfig } from 'src/configs/env.config';
import { RedisCachingService } from './redis-caching.service';

@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        host: envConfig.REDIS_HOST,
        port: +envConfig.REDIS_PORT,
        
      },
      errorLog:true,
      readyLog:true
    }),
  ],
  providers: [RedisCachingService],
  exports: [RedisCachingService]
})
export class RedisCachingModule {}
