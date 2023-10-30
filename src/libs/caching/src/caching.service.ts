import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PRODUCT_QUANTITY_PREFIX } from './caching-key.constant';

@Injectable()
export class CachingService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string) {
    return await this.cache.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number) {
    return ttl
      ? await this.cache.set(key, value, ttl)
      : await this.cache.set(key, value);
  }

  async del(key: string) {
    return await this.cache.del(key);
  }

  async setProductQuantity(productId: string, quantity: number) {
    return this.set(`${PRODUCT_QUANTITY_PREFIX}${productId}`, quantity, 30000);
  }

  async getProductQuantity(productId: string) {
    return await this.get<any>(`${PRODUCT_QUANTITY_PREFIX}${productId}`);
  }
}
