import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchBreedById,
  fetchBreedGroups,
  fetchBreedsPage,
} from '../../api/client';
import {
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
} from '../../storage/database';
import { Breed, BreedGroup, FilterState } from '../../types';

export const initialFilterState: FilterState = {
  searchQuery: '',
  selectedGroupIds: [],
  selectedSizeBands: [],
  selectedCoatLengths: [],
  hypoallergenicOnly: null,
  traitThresholds: {},
};

export interface BreedsState {
  breedsById: Record<string, Breed>;
  breedIds: string[];
  groupsById: Record<string, BreedGroup>;
  groupIds: string[];
  favorites: Record<string, boolean>;

  currentPage: number;
  lastPage: number;
  totalRecords: number;
  hasMorePages: boolean;
  isLoadingNextPage: boolean;

  lastSyncTimestamp: number | null;
  isSyncing: boolean;
  syncError: string | null;
  isOffline: boolean;
  isHydrated: boolean;

  filters: FilterState;
}

const initialState: BreedsState = {
  breedsById: {},
  breedIds: [],
  groupsById: {},
  groupIds: [],
  favorites: {},

  currentPage: 1,
  lastPage: 10,
  totalRecords: 283,
  hasMorePages: true,
  isLoadingNextPage: false,

  lastSyncTimestamp: null,
  isSyncing: false,
  syncError: null,
  isOffline: false,
  isHydrated: false,

  filters: initialFilterState,
};

export const initializeStore = createAsyncThunk(
  'breeds/initializeStore',
  async () => {
    const [cachedBreeds, cachedGroups, cachedSync, cachedFavs] =
      await Promise.all([
        loadAllBreeds(),
        loadAllGroups(),
        getMetadata<number>(METADATA_KEYS.LAST_SYNC),
        loadAllFavorites(),
      ]);

    const breedsById = cachedBreeds || {};
    const groupsById = cachedGroups || {};
    const breedIds = Object.keys(breedsById);
    const totalRecords = 283;
    const hasMorePages = breedIds.length < totalRecords;
    const currentPage = breedIds.length > 0 ? Math.floor(breedIds.length / 30) : 1;

    return {
      breedsById,
      breedIds,
      groupsById,
      groupIds: Object.keys(groupsById),
      lastSyncTimestamp: cachedSync || null,
      favorites: cachedFavs || {},
      currentPage,
      lastPage: 10,
      totalRecords,
      hasMorePages,
    };
  }
);

export const syncInitialData = createAsyncThunk<
  {
    breedsById: Record<string, Breed>;
    breedIds: string[];
    groupsById: Record<string, BreedGroup>;
    groupIds: string[];
    currentPage: number;
    lastPage: number;
    totalRecords: number;
    lastSyncTimestamp: number;
  },
  boolean | undefined,
  { rejectValue: string }
>('breeds/syncInitialData', async (_force, { rejectWithValue, getState }) => {
  try {
    const state = (getState() as { breeds: BreedsState }).breeds;
    const shouldFetchGroups = state.groupIds.length === 0 || _force;
    const [groupsData, page1Result] = await Promise.all([
      shouldFetchGroups ? fetchBreedGroups().catch(() => null) : null,
      fetchBreedsPage(1),
    ]);

    const newBreedsById: Record<string, Breed> = {};
    const newBreedIds: string[] = [];

    for (const breed of page1Result.breeds) {
      newBreedsById[breed.id] = breed;
      newBreedIds.push(breed.id);
    }

    const newGroupsById: Record<string, BreedGroup> = { ...state.groupsById };
    if (groupsData && groupsData.length > 0) {
      for (const group of groupsData) {
        newGroupsById[group.id] = group;
      }
    }

    const now = Date.now();

    await Promise.all([
      saveBreeds(newBreedsById),
      saveGroups(newGroupsById),
      setMetadata(METADATA_KEYS.LAST_SYNC, now),
    ]);

    return {
      breedsById: newBreedsById,
      breedIds: newBreedIds,
      groupsById: newGroupsById,
      groupIds: Object.keys(newGroupsById),
      currentPage: page1Result.currentPage,
      lastPage: page1Result.lastPage,
      totalRecords: page1Result.totalRecords,
      lastSyncTimestamp: now,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch data';
    return rejectWithValue(message);
  }
});

export const fetchNextPage = createAsyncThunk<
  {
    breeds: Breed[];
    currentPage: number;
    lastPage: number;
    totalRecords: number;
  },
  void,
  { rejectValue: string }
>(
  'breeds/fetchNextPage',
  async (_, { getState, rejectWithValue }) => {
    const state = (getState() as { breeds: BreedsState }).breeds;
    const nextPage = state.currentPage + 1;

    try {
      const result = await fetchBreedsPage(nextPage);

      // Persist only the newly received batch to SQLite
      await saveBreeds(result.breeds);

      return {
        breeds: result.breeds,
        currentPage: result.currentPage,
        lastPage: result.lastPage,
        totalRecords: result.totalRecords,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to load more breeds';
      return rejectWithValue(message);
    }
  },
  {
    condition: (_, { getState }) => {
      const state = (getState() as { breeds: BreedsState }).breeds;
      if (state.isLoadingNextPage || state.isSyncing) {
        return false;
      }
      if (state.currentPage >= state.lastPage) {
        return false;
      }
      return true;
    },
  }
);

export const refreshBreed = createAsyncThunk(
  'breeds/refreshBreed',
  async (breedId: string) => {
    const freshBreed = await fetchBreedById(breedId);
    await saveSingleBreed(freshBreed);
    return freshBreed;
  }
);

export const toggleFavorite = createAsyncThunk(
  'breeds/toggleFavorite',
  async (breedId: string, { getState }) => {
    const state = (getState() as { breeds: BreedsState }).breeds;
    const isFav = !state.favorites[breedId];
    await saveFavorite(breedId, isFav);
    return { breedId, isFavorite: isFav };
  }
);

export const breedsSlice = createSlice({
  name: 'breeds',
  initialState,
  reducers: {
    setOffline: (state, action: PayloadAction<boolean>) => {
      state.isOffline = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    resetFilters: state => {
      state.filters = {
        ...initialFilterState,
        searchQuery: state.filters.searchQuery,
      };
    },
    clearError: state => {
      state.syncError = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(initializeStore.fulfilled, (state, action) => {
        state.breedsById = action.payload.breedsById;
        state.breedIds = action.payload.breedIds;
        state.groupsById = action.payload.groupsById;
        state.groupIds = action.payload.groupIds;
        state.lastSyncTimestamp = action.payload.lastSyncTimestamp;
        state.favorites = action.payload.favorites;
        state.currentPage = action.payload.currentPage;
        state.lastPage = action.payload.lastPage;
        state.totalRecords = action.payload.totalRecords;
        state.hasMorePages = action.payload.hasMorePages;
        state.isHydrated = true;
      })
      .addCase(syncInitialData.pending, state => {
        state.isSyncing = true;
        state.syncError = null;
      })
      .addCase(syncInitialData.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.breedsById = action.payload.breedsById;
        state.breedIds = action.payload.breedIds;
        state.groupsById = action.payload.groupsById;
        state.groupIds = action.payload.groupIds;
        state.currentPage = action.payload.currentPage;
        state.lastPage = action.payload.lastPage;
        state.totalRecords = action.payload.totalRecords;
        state.hasMorePages = action.payload.breedIds.length < action.payload.totalRecords;
        state.lastSyncTimestamp = action.payload.lastSyncTimestamp;
        state.syncError = null;
      })
      .addCase(syncInitialData.rejected, (state, action) => {
        state.isSyncing = false;
        const msg = action.payload || 'Sync failed';
        state.syncError =
          state.breedIds.length > 0
            ? `Sync failed. Showing cached data (${msg})`
            : msg;
      })
      .addCase(fetchNextPage.pending, state => {
        state.isLoadingNextPage = true;
      })
      .addCase(fetchNextPage.fulfilled, (state, action) => {
        state.isLoadingNextPage = false;
        if (action.payload) {
          for (const breed of action.payload.breeds) {
            if (!state.breedsById[breed.id]) {
              state.breedsById[breed.id] = breed;
              state.breedIds.push(breed.id);
            }
          }
          state.currentPage = action.payload.currentPage;
          state.lastPage = action.payload.lastPage;
          state.totalRecords = action.payload.totalRecords;
          state.hasMorePages = state.breedIds.length < action.payload.totalRecords;
        }
      })
      .addCase(fetchNextPage.rejected, state => {
        state.isLoadingNextPage = false;
      })
      .addCase(refreshBreed.fulfilled, (state, action) => {
        state.breedsById[action.payload.id] = action.payload;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        state.favorites[action.payload.breedId] = action.payload.isFavorite;
      });
  },
});

export const {
  setOffline,
  setSearchQuery,
  setFilters,
  resetFilters,
  clearError,
} = breedsSlice.actions;

export default breedsSlice.reducer;
