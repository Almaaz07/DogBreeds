import { DogImage } from '../types';
import { loadFromStorage, saveToStorage, STORAGE_KEYS } from './asyncStorage';

export type ImageVariant = 'thumb' | 'medium' | 'large' | 'original';

interface CachedImageEntry {
  uri: string;
  variant: ImageVariant;
  estimatedBytes: number;
  lastAccessed: number;
}

interface ImageCacheIndex {
  entries: Record<string, CachedImageEntry>;
  totalEstimatedBytes: number;
}

const MAX_CACHE_BYTES = 50 * 1024 * 1024; // 50 MB
const ESTIMATED_SIZES: Record<ImageVariant, number> = {
  thumb: 30 * 1024,
  medium: 150 * 1024,
  large: 450 * 1024,
  original: 600 * 1024,
};

class ImageCacheManager {
  private index: ImageCacheIndex = {
    entries: {},
    totalEstimatedBytes: 0,
  };
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    const loaded = await loadFromStorage<ImageCacheIndex>(
      STORAGE_KEYS.IMAGE_CACHE_INDEX
    );
    if (loaded && loaded.entries) {
      this.index = loaded;
    }
    this.initialized = true;
  }

  getOptimalImageUrl(image: DogImage | undefined, requestedVariant: ImageVariant): string | undefined {
    if (!image) return undefined;

    switch (requestedVariant) {
      case 'thumb':
        return image.thumb || image.medium || image.url || image.large;
      case 'medium':
        return image.medium || image.large || image.url || image.thumb;
      case 'large':
      case 'original':
        return image.large || image.url || image.medium || image.thumb;
      default:
        return image.url || image.medium || image.thumb;
    }
  }

  async recordAccess(uri: string, variant: ImageVariant): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }

    const now = Date.now();
    const est = ESTIMATED_SIZES[variant] || 50 * 1024;

    if (this.index.entries[uri]) {
      this.index.entries[uri].lastAccessed = now;
    } else {
      this.index.entries[uri] = {
        uri,
        variant,
        estimatedBytes: est,
        lastAccessed: now,
      };
      this.index.totalEstimatedBytes += est;
    }

    if (this.index.totalEstimatedBytes > MAX_CACHE_BYTES) {
      this.evictOldest();
    }

    await saveToStorage(STORAGE_KEYS.IMAGE_CACHE_INDEX, this.index);
  }

  private evictOldest(): void {
    const list = Object.values(this.index.entries).sort(
      (a, b) => a.lastAccessed - b.lastAccessed
    );

    const target = MAX_CACHE_BYTES * 0.8;
    for (const item of list) {
      if (this.index.totalEstimatedBytes <= target) break;
      delete this.index.entries[item.uri];
      this.index.totalEstimatedBytes -= item.estimatedBytes;
    }
  }

  getCacheStats(): { count: number; totalMB: number } {
    return {
      count: Object.keys(this.index.entries).length,
      totalMB: Number((this.index.totalEstimatedBytes / (1024 * 1024)).toFixed(2)),
    };
  }
}

export const imageCache = new ImageCacheManager();
