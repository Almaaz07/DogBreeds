export interface NumericRange {
  min: number;
  max: number;
}

export interface BreedOrigin {
  era?: string;
  region?: string;
  country?: string;
}

export interface BreedCoat {
  type?: string;
  colors?: string[];
  length?: 'short' | 'medium' | 'long' | 'wire' | string;
}

export interface BreedTraits {
  energy: number;
  barking: number;
  drooling: number;
  grooming: number;
  shedding: number;
  temperament: string[];
  trainability: number;
  good_with_dogs: number;
  exercise_minutes: number;
  apartment_friendly: number;
  good_with_children: number;
  good_with_strangers: number;
}

export interface ImageAttribution {
  author?: string;
  license?: string;
  license_url?: string;
  source?: string;
  source_url?: string;
}

export interface DogImage {
  id: string;
  url: string;
  thumb?: string;
  medium?: string;
  large?: string;
  attribution?: ImageAttribution;
}

export interface BreedSource {
  title: string;
  url: string;
}

export interface BreedAttributes {
  name: string;
  description: string;
  life: NumericRange;
  male_weight: NumericRange;
  female_weight: NumericRange;
  male_height: NumericRange;
  female_height: NumericRange;
  hypoallergenic: boolean;
  origin: BreedOrigin;
  coat: BreedCoat;
  traits: BreedTraits;
  other_names: string[];
  recognized_by: string[];
  sources?: BreedSource[];
  images?: DogImage[];
}

export interface BreedRelationshipGroup {
  data?: {
    id: string;
    type: string;
  };
}

export interface Breed {
  id: string;
  type: 'breed';
  attributes: BreedAttributes;
  relationships?: {
    group?: BreedRelationshipGroup;
  };
}

export interface BreedGroupAttributes {
  name: string;
}

export interface BreedGroup {
  id: string;
  type: 'group';
  attributes: BreedGroupAttributes;
  relationships?: {
    breeds?: {
      data: Array<{ id: string; type: 'breed' }>;
    };
  };
}

export type SizeBand = 'small' | 'medium' | 'large' | 'giant';
export type CoatLength = 'short' | 'medium' | 'long' | 'wire';

export interface TraitThresholds {
  good_with_children?: number;
  good_with_dogs?: number;
  good_with_strangers?: number;
  energy?: number;
  trainability?: number;
  apartment_friendly?: number;
}

export interface FilterState {
  searchQuery: string;
  selectedGroupIds: string[];
  selectedSizeBands: SizeBand[];
  selectedCoatLengths: CoatLength[];
  hypoallergenicOnly: boolean | null;
  traitThresholds: TraitThresholds;
}

export interface SyncMetadata {
  lastSyncTimestamp: number | null;
  isSyncing: boolean;
  syncError: string | null;
  isOffline: boolean;
}

export type RootStackParamList = {
  BreedList: undefined;
  BreedDetail: { breedId: string };
};
