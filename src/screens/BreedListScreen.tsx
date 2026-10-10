import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Dog } from 'lucide-react-native';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { SyncFreshnessBanner } from '../components/common/SyncFreshnessBanner';
import { BreedCard } from '../components/list/BreedCard';
import { FilterModal } from '../components/list/FilterModal';
import { SearchBar } from '../components/list/SearchBar';
import { useAppDispatch, useAppSelector } from '../store';
import {
  clearError,
  fetchNextPage,
  setFilters,
  setSearchQuery,
  syncInitialData,
  toggleFavorite,
} from '../store/slices/breedsSlice';
import { darkTheme, lightTheme, spacing } from '../theme';
import { Breed, RootStackParamList } from '../types';
import { filterBreeds } from '../utils/filterBreeds';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BreedList'
>;

export const BreedListScreen: React.FC = () => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;
  const navigation = useNavigation<NavigationProp>();
  const dispatch = useAppDispatch();

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const {
    breedsById,
    groupsById,
    favorites,
    isSyncing,
    isLoadingNextPage,
    hasMorePages,
    currentPage,
    lastPage,
    totalRecords,
    isOffline,
    syncError,
    lastSyncTimestamp,
    filters,
  } = useAppSelector(state => state.breeds);

  const allBreedsList = useMemo(
    () => Object.values(breedsById),
    [breedsById]
  );

  const allGroupsList = useMemo(
    () => Object.values(groupsById),
    [groupsById]
  );

  const filteredBreeds = useMemo(() => {
    const list = filterBreeds(allBreedsList, filters);
    return list.sort((a, b) => {
      const gIdA = a.relationships?.group?.data?.id;
      const gIdB = b.relationships?.group?.data?.id;
      const groupA = gIdA ? groupsById[gIdA]?.attributes?.name || 'Other' : 'Other';
      const groupB = gIdB ? groupsById[gIdB]?.attributes?.name || 'Other' : 'Other';
      const groupCompare = groupA.localeCompare(groupB);
      if (groupCompare !== 0) return groupCompare;
      return a.attributes.name.localeCompare(b.attributes.name);
    });
  }, [allBreedsList, filters, groupsById]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.selectedGroupIds.length > 0) count += 1;
    if (filters.selectedSizeBands.length > 0) count += 1;
    if (filters.selectedCoatLengths.length > 0) count += 1;
    if (filters.hypoallergenicOnly !== null) count += 1;
    if (Object.keys(filters.traitThresholds).length > 0) count += 1;
    return count;
  }, [filters]);

  const totalCount = totalRecords || 283;

  const handleBreedPress = useCallback(
    (breedId: string) => {
      navigation.navigate('BreedDetail', { breedId });
    },
    [navigation]
  );

  const handleRefresh = useCallback(() => {
    dispatch(syncInitialData(true));
  }, [dispatch]);

  const handleEndReached = useCallback(() => {
    if (hasMorePages && !isLoadingNextPage && !isSyncing && !isOffline) {
      dispatch(fetchNextPage());
    }
  }, [dispatch, hasMorePages, isLoadingNextPage, isOffline, isSyncing]);

  const handleFavoriteToggle = useCallback(
    (id: string) => {
      dispatch(toggleFavorite(id));
    },
    [dispatch]
  );

  const renderItem = useCallback(
    ({ item }: { item: Breed }) => {
      const gId = item.relationships?.group?.data?.id;
      const group = gId ? groupsById[gId] : undefined;
      const isFav = !!favorites[item.id];

      return (
        <BreedCard
          breed={item}
          group={group}
          isFavorite={isFav}
          onPress={handleBreedPress}
          onFavoriteToggle={handleFavoriteToggle}
        />
      );
    },
    [favorites, groupsById, handleBreedPress, handleFavoriteToggle]
  );

  const keyExtractor = useCallback((item: Breed) => item.id, []);

  const isFiltering = filters.searchQuery.trim().length > 0 || activeFilterCount > 0;
  const subtitleText = isFiltering
    ? `${filteredBreeds.length} matching (${allBreedsList.length} of ${totalCount} loaded)`
    : `${allBreedsList.length} of ${totalCount} breeds loaded`;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.appHeader}>
        <Text style={[styles.appTitle, { color: theme.textPrimary }]}>
          Dog Explorer
        </Text>
        <Text style={[styles.appSubtitle, { color: theme.textMuted }]}>
          {subtitleText}
        </Text>
      </View>

      <SyncFreshnessBanner
        isOffline={isOffline}
        isSyncing={isSyncing}
        lastSyncTimestamp={lastSyncTimestamp}
        onRefreshPress={handleRefresh}
      />

      {syncError && (
        <ErrorBanner
          message={syncError}
          onRetry={handleRefresh}
          onDismiss={() => dispatch(clearError())}
        />
      )}

      <SearchBar
        value={filters.searchQuery}
        onChangeText={text => dispatch(setSearchQuery(text))}
        onFilterPress={() => setIsFilterModalOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {allBreedsList.length === 0 && isSyncing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading dog breeds dataset...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBreeds}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          initialNumToRender={8}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          windowSize={5}
          removeClippedSubviews={true}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.6}
          refreshControl={
            <RefreshControl
              refreshing={isSyncing && allBreedsList.length > 0}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
            />
          }
          ListFooterComponent={
            isLoadingNextPage ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={[styles.footerText, { color: theme.textMuted }]}>
                  Loading more breeds...
                </Text>
              </View>
            ) : undefined
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Dog size={48} color={theme.textMuted} style={styles.emptyIcon} />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                No breeds match your search
              </Text>
              <Text style={[styles.emptySubtitle, { color: theme.textMuted }]}>
                Try adjusting your filters or search keywords.
              </Text>
            </View>
          }
        />
      )}

      <FilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        groups={allGroupsList}
        currentFilters={filters}
        onApplyFilters={f => dispatch(setFilters(f))}
        totalFilteredCount={filteredBreeds.length}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  listContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    fontWeight: '500',
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  footerText: {
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    marginTop: 40,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
});
