interface CachedStatsEntry {
  data: any;
  expiresAt: number;
}

let statsCache: CachedStatsEntry | null = null;
const STATS_CACHE_TTL_MS = 15_000; // 15 seconds

export function getCachedOwnerStats(): any | null {
  if (!statsCache) return null;
  if (Date.now() > statsCache.expiresAt) {
    statsCache = null;
    return null;
  }
  return statsCache.data;
}

export function setCachedOwnerStats(data: any): void {
  statsCache = {
    data,
    expiresAt: Date.now() + STATS_CACHE_TTL_MS,
  };
}

export function invalidateOwnerStatsCache(): void {
  statsCache = null;
}
