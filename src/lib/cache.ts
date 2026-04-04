import crypto from 'crypto';

interface CacheEntry {
  value: string;
  expiresAt: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL_MS = 1000 * 60 * 60; // 1 hour TTL
  private readonly MAX_SIZE = 1000;

  private hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  set(key: string, value: string): void {
    if (this.cache.size >= this.MAX_SIZE) {
      // Basic eviction: delete oldest/first entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    
    this.cache.set(this.hashKey(key), {
      value,
      expiresAt: Date.now() + this.TTL_MS,
    });
  }

  get(key: string): string | null {
    const hashed = this.hashKey(key);
    const entry = this.cache.get(hashed);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(hashed);
      return null;
    }
    
    return entry.value;
  }
}

export const promptCache = new MemoryCache();
