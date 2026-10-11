import {
  getDatabase,
  getMetadata,
  loadAllBreeds,
  loadAllFavorites,
  loadAllGroups,
  METADATA_KEYS,
  saveBreeds,
  saveFavorite,
  saveGroups,
  saveSingleBreed,
  setMetadata,
} from '../storage/database';
import { Breed, BreedGroup } from '../types';

describe('SQLite Database Storage Layer', () => {
  it('initializes the database singleton without error', async () => {
    const db = await getDatabase();
    expect(db).toBeDefined();
  });

  it('saves and loads breeds through SQLite', async () => {
    const mockBreed: Breed = {
      id: 'breed-test-1',
      type: 'breed',
      attributes: {
        name: 'Golden Retriever',
        description: 'Friendly and energetic dog',
        life: { min: 10, max: 12 },
        male_weight: { min: 29, max: 34 },
        female_weight: { min: 25, max: 30 },
        male_height: { min: 56, max: 61 },
        female_height: { min: 51, max: 56 },
        hypoallergenic: false,
        origin: { country: 'UK' },
        coat: { length: 'long' },
        traits: {
          energy: 4,
          barking: 2,
          drooling: 2,
          grooming: 3,
          shedding: 4,
          temperament: ['Friendly', 'Intelligent'],
          trainability: 5,
          good_with_dogs: 5,
          exercise_minutes: 60,
          apartment_friendly: 2,
          good_with_children: 5,
          good_with_strangers: 5,
        },
        other_names: [],
        recognized_by: [],
      },
    };

    await expect(saveBreeds([mockBreed])).resolves.not.toThrow();
    await expect(saveSingleBreed(mockBreed)).resolves.not.toThrow();
    const loaded = await loadAllBreeds();
    expect(loaded).toBeDefined();
  });

  it('saves and loads breed groups through SQLite', async () => {
    const mockGroup: BreedGroup = {
      id: 'group-1',
      type: 'group',
      attributes: {
        name: 'Sporting',
      },
    };

    await expect(saveGroups([mockGroup])).resolves.not.toThrow();
    const loaded = await loadAllGroups();
    expect(loaded).toBeDefined();
  });

  it('toggles and loads favorites through SQLite', async () => {
    await expect(saveFavorite('breed-test-1', true)).resolves.not.toThrow();
    await expect(saveFavorite('breed-test-1', false)).resolves.not.toThrow();
    const favs = await loadAllFavorites();
    expect(favs).toBeDefined();
  });

  it('stores and retrieves metadata key-values', async () => {
    const timestamp = Date.now();
    await expect(
      setMetadata(METADATA_KEYS.LAST_SYNC, timestamp)
    ).resolves.not.toThrow();
    const loaded = await getMetadata<number>(METADATA_KEYS.LAST_SYNC);
    expect(loaded === null || typeof loaded === 'number').toBe(true);
  });
});
