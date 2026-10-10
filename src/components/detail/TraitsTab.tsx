import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { borderRadius, darkTheme, lightTheme, spacing } from '../../theme';
import { Breed } from '../../types';
import { TraitScaleMeter } from './TraitScaleMeter';

interface Props {
  breed: Breed;
}

export const TraitsTab: React.FC<Props> = ({ breed }) => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;
  const traits = breed.attributes.traits;

  if (!traits) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>
          No trait evaluations recorded for this breed.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {traits.temperament && traits.temperament.length > 0 && (
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Temperament Personality
          </Text>
          <View style={styles.chipRow}>
            {traits.temperament.map((t, idx) => (
              <View
                key={idx}
                style={[
                  styles.chip,
                  {
                    backgroundColor: theme.accentSubtle,
                    borderColor: theme.accent,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: theme.accent }]}>
                  {t}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Social & Family Compatibility
        </Text>
        <TraitScaleMeter
          label="Good with Children"
          value={traits.good_with_children}
          color="#10B981"
        />
        <TraitScaleMeter
          label="Good with Other Dogs"
          value={traits.good_with_dogs}
          color="#3B82F6"
        />
        <TraitScaleMeter
          label="Good with Strangers"
          value={traits.good_with_strangers}
          color="#8B5CF6"
        />
        <TraitScaleMeter
          label="Apartment Friendly"
          value={traits.apartment_friendly}
          color="#EC4899"
        />
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Energy & Activity Needs
        </Text>
        <TraitScaleMeter
          label="Energy Level"
          value={traits.energy}
          color="#F59E0B"
        />
        <TraitScaleMeter
          label="Trainability"
          value={traits.trainability}
          color="#06B6D4"
        />
        <TraitScaleMeter
          label="Daily Exercise"
          value={traits.exercise_minutes}
          max={120}
          unit="min"
          color="#14B8A6"
        />
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Maintenance & Grooming
        </Text>
        <TraitScaleMeter
          label="Barking Level"
          value={traits.barking}
          color="#F97316"
        />
        <TraitScaleMeter
          label="Grooming Requirements"
          value={traits.grooming}
          color="#6366F1"
        />
        <TraitScaleMeter
          label="Shedding Amount"
          value={traits.shedding}
          color="#EAB308"
        />
        <TraitScaleMeter
          label="Drooling Frequency"
          value={traits.drooling}
          color="#64748B"
        />
      </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
