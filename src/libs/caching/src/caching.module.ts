import { Module } from '@nestjs/common';
import { CachingService } from './caching.service';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';
import appEnv from '@configs/env.config';

@Module({
  imports: [
    CacheModule.registerAsync({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      useFactory: async () => {
        const store = await redisStore.redisStore({
          socket: {
            host: appEnv().redis.REDIS_HOST,
            port: appEnv().redis.REDIS_PORT,
          },
        });
        return {
          store,
          isGlobal: true,
        };
      },
    }),
  ],
  providers: [CachingService],
  exports: [CachingService],
})
export class CachingModule {}
