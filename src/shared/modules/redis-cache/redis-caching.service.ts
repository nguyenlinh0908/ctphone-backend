import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

interface ISetRedis {
  key: string;
  value: any;
  /** Time to live in second */
  ttl?: number;
}

@Injectable()
export class RedisCachingService {
  private redis: Redis;

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getClient();
  }

  async set({ key, value, ttl }: ISetRedis) {
    this.redis.set(key, value, 'EX', ttl);
  }

  async get(key: string) {
    return this.redis.get(key);
  }

  async del(key: string) {
    this.redis.del([key]);
  }
}
