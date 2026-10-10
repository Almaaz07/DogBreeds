import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import { borderRadius, darkTheme, lightTheme, spacing } from '../../theme';
import { Breed } from '../../types';

interface Props {
  breed: Breed;
}

export const OverviewTab: React.FC<Props> = ({ breed }) => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;
  const attrs = breed.attributes;

  const openUrl = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) Linking.openURL(url);
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          About the Breed
        </Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {attrs.description || 'No detailed description available.'}
        </Text>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Physical Statistics
        </Text>

        <View style={styles.grid}>
          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              Life Span
            </Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {attrs.life?.min} - {attrs.life?.max} years
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              Hypoallergenic
            </Text>
            <Text
              style={[
                styles.statValue,
                { color: attrs.hypoallergenic ? theme.success : theme.textPrimary },
              ]}
            >
              {attrs.hypoallergenic ? 'Yes' : 'No'}
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              Male Weight
            </Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {attrs.male_weight?.min} - {attrs.male_weight?.max} kg
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              Female Weight
            </Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {attrs.female_weight?.min} - {attrs.female_weight?.max} kg
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              Male Height
            </Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {attrs.male_height?.min} - {attrs.male_height?.max} cm
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>
              Female Height
            </Text>
            <Text style={[styles.statValue, { color: theme.textPrimary }]}>
              {attrs.female_height?.min} - {attrs.female_height?.max} cm
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Origin & Heritage
        </Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
            Country:
          </Text>
          <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
            {attrs.origin?.country || 'Unknown'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
            Region:
          </Text>
          <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
            {attrs.origin?.region || 'Unknown'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
            Era:
          </Text>
          <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
            {attrs.origin?.era || 'Unknown'}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Coat Details
        </Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
            Length:
          </Text>
          <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
            {attrs.coat?.length || 'Standard'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
            Type:
          </Text>
          <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
            {attrs.coat?.type || 'Standard'}
          </Text>
        </View>
        {attrs.coat?.colors && attrs.coat.colors.length > 0 && (
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
              Colors:
            </Text>
            <Text
              style={[styles.infoValue, { color: theme.textPrimary }]}
              numberOfLines={2}
            >
              {attrs.coat.colors.join(', ')}
            </Text>
          </View>
        )}
      </View>

      {attrs.other_names && attrs.other_names.length > 0 && (
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Also Known As
          </Text>
          <View style={styles.chipRow}>
            {attrs.other_names.map((name, idx) => (
              <View
                key={idx}
                style={[
                  styles.chip,
                  {
                    backgroundColor: theme.surfaceSubtle,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: theme.textSecondary }]}>
                  {name}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {attrs.recognized_by && attrs.recognized_by.length > 0 && (
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Recognizing Kennel Clubs
          </Text>
          <View style={styles.chipRow}>
            {attrs.recognized_by.map((club, idx) => (
              <View
                key={idx}
                style={[
                  styles.chip,
                  {
                    backgroundColor: theme.primaryLight,
                    borderColor: theme.primary,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: theme.primary }]}>
                  {club}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {attrs.sources && attrs.sources.length > 0 && (
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Sources & References
          </Text>
          {attrs.sources.map((src, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.sourceRow}
              onPress={() => openUrl(src.url)}
            >
              <ExternalLink size={14} color={theme.primary} />
              <Text
                style={[styles.sourceTitle, { color: theme.primary }]}
                numberOfLines={1}
              >
                {src.title || src.url}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  card: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statBox: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    width: 80,
    fontSize: 13,
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  sourceTitle: {
    fontSize: 13,
    fontWeight: '500',
    textDecorationLine: 'underline',
    flex: 1,
  },
});
