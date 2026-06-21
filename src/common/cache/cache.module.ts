import { Global, Injectable, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

@Injectable()
export class CacheService {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return JSON.parse(entry.value) as T;
  }

  async set(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
    this.store.set(key, {
      value: JSON.stringify(value),
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

@Global()
@Module({
  imports: [CacheModule.register()],
  providers: [CacheService],
  exports: [CacheService, CacheModule],
})
export class AppCacheModule {}
