import { DB, open } from '@op-engineering/op-sqlite';
import { Breed, BreedGroup } from '../types';

export interface CachedImageEntry {
  uri: string;
  variant: 'thumb' | 'medium' | 'large' | 'original';
  estimatedBytes: number;
  lastAccessed: number;
}

export const METADATA_KEYS = {
  LAST_SYNC: 'last_sync_timestamp',
  TOTAL_RECORDS: 'total_records',
  CURRENT_PAGE: 'current_page',
} as const;

let db: DB | null = null;

export async function getDatabase(): Promise<DB> {
  if (!db) {
    db = open({ name: 'dog_explorer_v1.db' });
    db.executeSync('CREATE TABLE IF NOT EXISTS breeds (id TEXT PRIMARY KEY, name TEXT, group_id TEXT, data TEXT NOT NULL);');
    db.executeSync('CREATE TABLE IF NOT EXISTS breed_groups (id TEXT PRIMARY KEY, name TEXT, data TEXT NOT NULL);');
    db.executeSync('CREATE TABLE IF NOT EXISTS favorites (breed_id TEXT PRIMARY KEY, is_favorite INTEGER NOT NULL, updated_at INTEGER NOT NULL);');
    db.executeSync('CREATE TABLE IF NOT EXISTS app_metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);');
    db.executeSync('CREATE TABLE IF NOT EXISTS image_cache (uri TEXT PRIMARY KEY, variant TEXT, estimated_bytes INTEGER, last_accessed INTEGER);');
  }
  return db;
}

// Breeds
export async function saveBreeds(breeds: Record<string, Breed> | Breed[]): Promise<void> {
  const d = await getDatabase();
  const list = Array.isArray(breeds) ? breeds : Object.values(breeds);
  console.log(`[SQLite:SAVE] Saving ${list.length} breeds into table 'breeds'...`);
  await d.transaction(async tx => {
    for (const b of list) {
      await tx.execute(
        'INSERT OR REPLACE INTO breeds (id, name, group_id, data) VALUES (?, ?, ?, ?);',
        [b.id, b.attributes?.name || '', b.relationships?.group?.data?.id || '', JSON.stringify(b)]
      );
    }
  });
  console.log(`[SQLite:SAVE] Successfully saved ${list.length} breeds into table 'breeds09090'.` ,list);
}

export const saveSingleBreed = (breed: Breed) => saveBreeds([breed]);

export async function loadAllBreeds(): Promise<Record<string, Breed>> {
  const d = await getDatabase();
  console.log("[SQLite:READ] Executing: SELECT data FROM breeds;");
  const res = await d.execute('SELECT data FROM breeds;');
  console.log(`[SQLite:READ] Retrieved ${res.rows.length} rows from table 'breeds'.`);

  const map: Record<string, Breed> = {};
  for (const row of res.rows) {
    if (typeof row?.data === 'string') {
      try {
        const item = JSON.parse(row.data) as Breed;
        if (item.id) map[item.id] = item;
      } catch {}
    }
  }
  console.log(`[SQLite:READ] Parsed ${Object.keys(map).length} breeds into memory.`, map);
  return map;
}

// Groups
export async function saveGroups(groups: Record<string, BreedGroup> | BreedGroup[]): Promise<void> {
  const d = await getDatabase();
  const list = Array.isArray(groups) ? groups : Object.values(groups);
  console.log(`[SQLite:SAVE] Saving ${list.length} groups into table 'breed_groups'...`);
  await d.transaction(async tx => {
    for (const g of list) {
      await tx.execute(
        'INSERT OR REPLACE INTO breed_groups (id, name, data) VALUES (?, ?, ?);',
        [g.id, g.attributes?.name || '', JSON.stringify(g)]
      );
    }
  });
  console.log(`[SQLite:SAVE] Successfully saved ${list.length} groups into table 'breed_groups'.`);
}

export async function loadAllGroups(): Promise<Record<string, BreedGroup>> {
  const d = await getDatabase();
  console.log("[SQLite:READ] Executing: SELECT data FROM breed_groups;");
  const res = await d.execute('SELECT data FROM breed_groups;');
  console.log(`[SQLite:READ] Retrieved ${res.rows.length} rows from table 'breed_groups'.`);

  const map: Record<string, BreedGroup> = {};
  for (const row of res.rows) {
    if (typeof row?.data === 'string') {
      try {
        const item = JSON.parse(row.data) as BreedGroup;
        if (item.id) map[item.id] = item;
      } catch {}
    }
  }
  console.log(`[SQLite:READ] Parsed ${Object.keys(map).length} groups into memory.`);
  return map;
}

// Favorites
export async function saveFavorite(breedId: string, isFavorite: boolean): Promise<void> {
  const d = await getDatabase();
  if (isFavorite) {
    console.log(`[SQLite:WRITE] Adding breed '${breedId}' to table 'favorites'...`);
    await d.execute(
      'INSERT OR REPLACE INTO favorites (breed_id, is_favorite, updated_at) VALUES (?, 1, ?);',
      [breedId, Date.now()]
    );
  } else {
    console.log(`[SQLite:WRITE] Removing breed '${breedId}' from table 'favorites'...`);
    await d.execute('DELETE FROM favorites WHERE breed_id = ?;', [breedId]);
  }
}

export async function loadAllFavorites(): Promise<Record<string, boolean>> {
  const d = await getDatabase();
  console.log("[SQLite:READ] Executing: SELECT breed_id, is_favorite FROM favorites;");
  const res = await d.execute('SELECT breed_id, is_favorite FROM favorites;');
  console.log(`[SQLite:READ] Retrieved ${res.rows.length} rows from table 'favorites'.`);

  const map: Record<string, boolean> = {};
  for (const row of res.rows) {
    if (typeof row?.breed_id === 'string') {
      map[row.breed_id] = row.is_favorite === 1;
    }
  }
  console.log(`[SQLite:READ] Active favorites count: ${Object.keys(map).length}`);
  return map;
}

// Metadata
export async function setMetadata<T>(key: string, value: T): Promise<void> {
  const d = await getDatabase();
  console.log(`[SQLite:WRITE] Saving metadata key='${key}' into table 'app_metadata'...`);
  await d.execute(
    'INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?);',
    [key, JSON.stringify(value)]
  );
}

export async function getMetadata<T>(key: string): Promise<T | null> {
  const d = await getDatabase();
  console.log(`[SQLite:READ] Executing: SELECT value FROM app_metadata WHERE key = '${key}' LIMIT 1;`);
  const res = await d.execute('SELECT value FROM app_metadata WHERE key = ? LIMIT 1;', [key]);

  if (res.rows.length > 0 && typeof res.rows[0]?.value === 'string') {
    try {
      const parsed = JSON.parse(res.rows[0].value) as T;
      console.log(`[SQLite:READ] Found metadata for key='${key}':`, parsed);
      return parsed;
    } catch {}
  }
  console.log(`[SQLite:READ] No metadata found for key='${key}' (null).`);
  return null;
}

// Image Cache
export async function loadImageCacheIndex(): Promise<{
  entries: Record<string, CachedImageEntry>;
  totalEstimatedBytes: number;
}> {
  const d = await getDatabase();
  console.log("[SQLite:READ] Executing: SELECT uri, variant, estimated_bytes, last_accessed FROM image_cache;");
  const res = await d.execute('SELECT uri, variant, estimated_bytes, last_accessed FROM image_cache;');
  console.log(`[SQLite:READ] Retrieved ${res.rows.length} entries from table 'image_cache'.`);

  const entries: Record<string, CachedImageEntry> = {};
  let totalEstimatedBytes = 0;
  for (const r of res.rows) {
    if (typeof r?.uri === 'string') {
      const bytes = Number(r.estimated_bytes) || 0;
      entries[r.uri] = {
        uri: r.uri,
        variant: (r.variant as CachedImageEntry['variant']) || 'thumb',
        estimatedBytes: bytes,
        lastAccessed: Number(r.last_accessed) || 0,
      };
      totalEstimatedBytes += bytes;
    }
  }
  return { entries, totalEstimatedBytes };
}

export async function saveImageCacheEntry(entry: CachedImageEntry): Promise<void> {
  const d = await getDatabase();
  await d.execute(
    'INSERT OR REPLACE INTO image_cache (uri, variant, estimated_bytes, last_accessed) VALUES (?, ?, ?, ?);',
    [entry.uri, entry.variant, entry.estimatedBytes, entry.lastAccessed]
  );
}

export async function evictOldestImageCacheEntries(
  targetMaxBytes: number,
  currentTotalBytes: number
): Promise<void> {
  const d = await getDatabase();
  const res = await d.execute('SELECT uri, estimated_bytes FROM image_cache ORDER BY last_accessed ASC;');
  let rem = currentTotalBytes;
  const toDelete: string[] = [];
  for (const r of res.rows) {
    if (rem <= targetMaxBytes) break;
    if (typeof r?.uri === 'string') {
      toDelete.push(r.uri);
      rem -= Number(r.estimated_bytes) || 0;
    }
  }
  if (toDelete.length > 0) {
    await d.transaction(async tx => {
      for (const uri of toDelete) {
        await tx.execute('DELETE FROM image_cache WHERE uri = ?;', [uri]);
      }
    });
  }
}
