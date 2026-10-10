import { configureStore } from '@reduxjs/toolkit';
import breedsReducer, {
  clearError,
  initialFilterState,
  resetFilters,
  setFilters,
  setOffline,
  setSearchQuery,
  toggleFavorite,
} from '../store/slices/breedsSlice';

describe('Redux Toolkit Breeds Slice', () => {
  let testStore = configureStore({
    reducer: {
      breeds: breedsReducer,
    },
  });

  beforeEach(() => {
    testStore = configureStore({
      reducer: {
        breeds: breedsReducer,
      },
    });
  });

  it('updates search query', () => {
    testStore.dispatch(setSearchQuery('poodle'));
    expect(testStore.getState().breeds.filters.searchQuery).toBe('poodle');
  });

  it('updates and resets multi-facet filters', () => {
    testStore.dispatch(
      setFilters({
        selectedSizeBands: ['small', 'medium'],
        hypoallergenicOnly: true,
        traitThresholds: { good_with_children: 4 },
      })
    );

    expect(testStore.getState().breeds.filters.selectedSizeBands).toEqual([
      'small',
      'medium',
    ]);
    expect(testStore.getState().breeds.filters.hypoallergenicOnly).toBe(true);
    expect(
      testStore.getState().breeds.filters.traitThresholds.good_with_children
    ).toBe(4);

    testStore.dispatch(resetFilters());
    expect(testStore.getState().breeds.filters.selectedSizeBands).toEqual([]);
    expect(testStore.getState().breeds.filters.hypoallergenicOnly).toBeNull();
    expect(testStore.getState().breeds.filters.traitThresholds).toEqual({});
  });

  it('updates offline status', () => {
    testStore.dispatch(setOffline(true));
    expect(testStore.getState().breeds.isOffline).toBe(true);

    testStore.dispatch(setOffline(false));
    expect(testStore.getState().breeds.isOffline).toBe(false);
  });

  it('handles toggling favorites', async () => {
    await testStore.dispatch(toggleFavorite('breed-1'));
    expect(testStore.getState().breeds.favorites['breed-1']).toBe(true);

    await testStore.dispatch(toggleFavorite('breed-1'));
    expect(testStore.getState().breeds.favorites['breed-1']).toBe(false);
  });

  it('clears sync error message', () => {
    testStore.dispatch(clearError());
    expect(testStore.getState().breeds.syncError).toBeNull();
  });
});
