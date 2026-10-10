import React, { useCallback } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Dog, Heart, MapPin } from 'lucide-react-native';
import { imageCache } from '../../storage/imageCache';
import { borderRadius, darkTheme, lightTheme, spacing } from '../../theme';
import { Breed, BreedGroup } from '../../types';
import { deriveSizeBand } from '../../utils/filterBreeds';

interface Props {
  breed: Breed;
  group?: BreedGroup;
  isFavorite: boolean;
  onPress: (breedId: string) => void;
  onFavoriteToggle: (breedId: string) => void;
}

export const BreedCardComponent: React.FC<Props> = ({
  breed,
  group,
  isFavorite,
  onPress,
  onFavoriteToggle,
}) => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const firstImage = breed.attributes.images?.[0];
  const thumbUrl = imageCache.getOptimalImageUrl(firstImage, 'thumb');

  const size = deriveSizeBand(breed);
  const sizeLabels: Record<string, string> = {
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    giant: 'Giant',
  };

  const lifeSpan = breed.attributes.life
    ? `${breed.attributes.life.min}-${breed.attributes.life.max} yrs`
    : null;

  const weight = breed.attributes.male_weight
    ? `${breed.attributes.male_weight.min}-${breed.attributes.male_weight.max} kg`
    : null;

  const originCountry = breed.attributes.origin?.country;
  const coatType = breed.attributes.coat?.type || breed.attributes.coat?.length;

  const handleCardPress = useCallback(() => {
    onPress(breed.id);
  }, [onPress, breed.id]);

  const handleFavPress = useCallback(() => {
    onFavoriteToggle(breed.id);
  }, [onFavoriteToggle, breed.id]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowColor: theme.cardShadow,
        },
      ]}
      onPress={handleCardPress}
    >
      <View style={styles.imageContainer}>
        {thumbUrl ? (
          <Image
            source={{ uri: thumbUrl }}
            style={styles.image}
            resizeMode="cover"
            fadeDuration={0}
          />
        ) : (
          <View
            style={[
              styles.imagePlaceholder,
              { backgroundColor: theme.surfaceSubtle },
            ]}
          >
            <Dog size={32} color={theme.textMuted} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            style={[styles.name, { color: theme.textPrimary }]}
            numberOfLines={1}
          >
            {breed.attributes.name}
          </Text>
        </View>

        <View style={styles.metaRow}>
          {group && (
            <Text
              style={[styles.groupName, { color: theme.primary }]}
              numberOfLines={1}
            >
              {group.attributes.name}
            </Text>
          )}
          {originCountry && (
            <View style={styles.originContainer}>
              <MapPin size={11} color={theme.textMuted} />
              <Text style={[styles.originText, { color: theme.textMuted }]}>
                {originCountry}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.badgesRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
              {sizeLabels[size]}
            </Text>
          </View>

          {weight && (
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                {weight}
              </Text>
            </View>
          )}

          {lifeSpan && (
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                {lifeSpan}
              </Text>
            </View>
          )}

          {coatType && (
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.badgeText, { color: theme.textSecondary }]}>
                {coatType}
              </Text>
            </View>
          )}

          {breed.attributes.hypoallergenic && (
            <View
              style={[
                styles.badge,
                { backgroundColor: theme.accentSubtle, borderColor: theme.accent },
              ]}
            >
              <Text style={[styles.badgeText, { color: theme.accent }]}>
                Hypoallergenic
              </Text>
            </View>
          )}
        </View>

        {breed.attributes.traits?.temperament &&
          breed.attributes.traits.temperament.length > 0 && (
            <Text
              style={[styles.temperament, { color: theme.textMuted }]}
              numberOfLines={1}
            >
              {breed.attributes.traits.temperament.slice(0, 3).join(' • ')}
            </Text>
          )}
      </View>
    </TouchableOpacity>
  );
};

export const BreedCard = React.memo(BreedCardComponent);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  imageContainer: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    marginRight: spacing.xs,
  },
  favoriteButton: {
    padding: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  groupName: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  originContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  originText: {
    fontSize: 11,
    fontWeight: '500',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  temperament: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});
