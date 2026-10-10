import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  BREEDS: '@dog_explorer_breeds_v1',
  GROUPS: '@dog_explorer_groups_v1',
  LAST_SYNC: '@dog_explorer_last_sync_v1',
  IMAGE_CACHE_INDEX: '@dog_explorer_img_index_v1',
  FAVORITES: '@dog_explorer_favs_v1',
  PAGINATION: '@dog_explorer_pagination_v1',
} as const;

export async function saveToStorage<T>(key: string, data: T): Promise<void> {
  try {
    const serialized = JSON.stringify(data);
    await AsyncStorage.setItem(key, serialized);
  } catch {
    console.log('error comes in getting data from the async')
  }
}

export async function loadFromStorage<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function removeFromStorage(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
   console.log('error in removing datafrom the async')
  }
}

export { STORAGE_KEYS };
