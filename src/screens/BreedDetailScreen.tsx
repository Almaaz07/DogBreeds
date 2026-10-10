import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Heart, MapPin, RotateCw } from 'lucide-react-native';
import { GalleryTab } from '../components/detail/GalleryTab';
import { OverviewTab } from '../components/detail/OverviewTab';
import { TraitsTab } from '../components/detail/TraitsTab';
import { imageCache } from '../storage/imageCache';
import { useAppDispatch, useAppSelector } from '../store';
import { refreshBreed, toggleFavorite } from '../store/slices/breedsSlice';
import { borderRadius, darkTheme, lightTheme, spacing } from '../theme';
import { RootStackParamList } from '../types';

type RouteProps = RouteProp<RootStackParamList, 'BreedDetail'>;
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

type DetailTab = 'overview' | 'traits' | 'gallery';

export const BreedDetailScreen: React.FC = () => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProps>();
  const { breedId } = route.params;

  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { breedsById, groupsById, favorites } = useAppSelector(
    state => state.breeds
  );

  const breed = breedsById[breedId];
  const gId = breed?.relationships?.group?.data?.id;
  const group = gId ? groupsById[gId] : undefined;
  const isFav = !!favorites[breedId];

  useEffect(() => {
    if (breedId) {
      dispatch(refreshBreed(breedId));
    }
  }, [breedId, dispatch]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await dispatch(refreshBreed(breedId));
    setIsRefreshing(false);
  };

  if (!breed) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
        edges={['top', 'left', 'right']}
      >
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, { color: theme.textSecondary }]}>
            Breed not found in local cache.
          </Text>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const headerImage = breed.attributes.images?.[0];
  const headerImageUrl = imageCache.getOptimalImageUrl(headerImage, 'medium');

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['top', 'left', 'right']}
    >
      <View
        style={[
          styles.topNav,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.navButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={24} color={theme.primary} />
        </TouchableOpacity>

        <Text
          style={[styles.navTitle, { color: theme.textPrimary }]}
          numberOfLines={1}
        >
          {breed.attributes.name}
        </Text>

        <View style={styles.navActions}>
          <TouchableOpacity
            onPress={handleManualRefresh}
            style={styles.navButton}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <RotateCw size={18} color={theme.textPrimary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => dispatch(toggleFavorite(breedId))}
            style={styles.navButton}
          >
            <Heart
              size={20}
              color={isFav ? '#EF4444' : theme.textPrimary}
              fill={isFav ? '#EF4444' : 'none'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={[
          styles.heroHeader,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        {headerImageUrl && (
          <Image
            source={{ uri: headerImageUrl }}
            style={styles.heroThumbnail}
            resizeMode="cover"
          />
        )}
        <View style={styles.heroInfo}>
          <Text style={[styles.heroName, { color: theme.textPrimary }]}>
            {breed.attributes.name}
          </Text>
          {group && (
            <Text style={[styles.heroGroup, { color: theme.primary }]}>
              {group.attributes.name}
            </Text>
          )}
          {breed.attributes.origin?.country && (
            <View style={styles.originRow}>
              <MapPin size={12} color={theme.textMuted} />
              <Text style={[styles.heroOrigin, { color: theme.textMuted }]}>
                {breed.attributes.origin.country}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        {(
          [
            { key: 'overview', label: 'Overview' },
            { key: 'traits', label: 'Traits' },
            { key: 'gallery', label: `Gallery (${breed.attributes.images?.length || 0})` },
          ] as const
        ).map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabItem,
                isActive && {
                  borderBottomColor: theme.primary,
                  borderBottomWidth: 3,
                },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? theme.primary : theme.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.tabContent}>
        {activeTab === 'overview' && <OverviewTab breed={breed} />}
        {activeTab === 'traits' && <TraitsTab breed={breed} />}
        {activeTab === 'gallery' && (
          <GalleryTab images={breed.attributes.images} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navButton: {
    padding: spacing.xs,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  heroThumbnail: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    fontSize: 19,
    fontWeight: '800',
  },
  heroGroup: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  originRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  heroOrigin: {
    fontSize: 12,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
  },
  tabContent: {
    flex: 1,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  notFoundText: {
    fontSize: 16,
    marginBottom: spacing.lg,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
