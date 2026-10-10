import { Breed, FilterState } from '../types';
import { deriveSizeBand, filterBreeds } from '../utils/filterBreeds';

const mockBreeds: Breed[] = [
  {
    id: 'b1',
    type: 'breed',
    attributes: {
      name: 'Affenpinscher',
      description: 'Small German dog',
      life: { min: 12, max: 15 },
      male_weight: { min: 4, max: 6 },
      female_weight: { min: 4, max: 6 },
      male_height: { min: 23, max: 29 },
      female_height: { min: 23, max: 29 },
      hypoallergenic: true,
      origin: { country: 'Germany' },
      coat: { length: 'short', type: 'wire' },
      traits: {
        energy: 3,
        barking: 2,
        drooling: 1,
        grooming: 3,
        shedding: 2,
        temperament: ['playful', 'curious'],
        trainability: 3,
        good_with_dogs: 4,
        exercise_minutes: 30,
        apartment_friendly: 5,
        good_with_children: 4,
        good_with_strangers: 3,
      },
      other_names: ['Monkey Terrier'],
      recognized_by: ['AKC'],
    },
    relationships: {
      group: { data: { id: 'g-toy', type: 'group' } },
    },
  },
  {
    id: 'b2',
    type: 'breed',
    attributes: {
      name: 'Golden Retriever',
      description: 'Friendly family dog',
      life: { min: 10, max: 12 },
      male_weight: { min: 29, max: 34 },
      female_weight: { min: 25, max: 32 },
      male_height: { min: 56, max: 61 },
      female_height: { min: 51, max: 56 },
      hypoallergenic: false,
      origin: { country: 'United Kingdom' },
      coat: { length: 'long', type: 'double' },
      traits: {
        energy: 4,
        barking: 2,
        drooling: 2,
        grooming: 3,
        shedding: 4,
        temperament: ['friendly', 'intelligent', 'devoted'],
        trainability: 5,
        good_with_dogs: 5,
        exercise_minutes: 60,
        apartment_friendly: 2,
        good_with_children: 5,
        good_with_strangers: 5,
      },
      other_names: ['Yellow Retriever'],
      recognized_by: ['AKC', 'UKC'],
    },
    relationships: {
      group: { data: { id: 'g-sporting', type: 'group' } },
    },
  },
];

const baseFilters: FilterState = {
  searchQuery: '',
  selectedGroupIds: [],
  selectedSizeBands: [],
  selectedCoatLengths: [],
  hypoallergenicOnly: null,
  traitThresholds: {},
};

describe('filterBreeds', () => {
  it('derives correct size bands from weight ranges', () => {
    expect(deriveSizeBand(mockBreeds[0])).toBe('small');
    expect(deriveSizeBand(mockBreeds[1])).toBe('large');
  });

  it('filters by breed name query', () => {
    const res = filterBreeds(mockBreeds, {
      ...baseFilters,
      searchQuery: 'affen',
    });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('b1');
  });

  it('filters by other_names query', () => {
    const res = filterBreeds(mockBreeds, {
      ...baseFilters,
      searchQuery: 'monkey',
    });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('b1');
  });

  it('filters by breed group', () => {
    const res = filterBreeds(mockBreeds, {
      ...baseFilters,
      selectedGroupIds: ['g-sporting'],
    });
    expect(res).toHaveLength(1);
    expect(res[0].attributes.name).toBe('Golden Retriever');
  });

  it('filters by size band', () => {
    const res = filterBreeds(mockBreeds, {
      ...baseFilters,
      selectedSizeBands: ['small'],
    });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('b1');
  });

  it('filters by coat length', () => {
    const res = filterBreeds(mockBreeds, {
      ...baseFilters,
      selectedCoatLengths: ['long'],
    });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('b2');
  });

  it('filters by hypoallergenic flag', () => {
    const res = filterBreeds(mockBreeds, {
      ...baseFilters,
      hypoallergenicOnly: true,
    });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('b1');
  });

  it('filters by trait threshold', () => {
    const res = filterBreeds(mockBreeds, {
      ...baseFilters,
      traitThresholds: { good_with_children: 5 },
    });
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('b2');
  });
});
