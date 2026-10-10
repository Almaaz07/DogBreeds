import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star } from 'lucide-react-native';
import {
  borderRadius,
  darkTheme,
  lightTheme,
  spacing,
} from '../../theme';
import {
  BreedGroup,
  CoatLength,
  FilterState,
  SizeBand,
} from '../../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  groups: BreedGroup[];
  currentFilters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  totalFilteredCount: number;
}

const SIZE_BANDS: { label: string; value: SizeBand }[] = [
  { label: 'Small (<10kg)', value: 'small' },
  { label: 'Medium (10-25kg)', value: 'medium' },
  { label: 'Large (25-45kg)', value: 'large' },
  { label: 'Giant (>45kg)', value: 'giant' },
];

const COAT_LENGTHS: { label: string; value: CoatLength }[] = [
  { label: 'Short', value: 'short' },
  { label: 'Medium', value: 'medium' },
  { label: 'Long', value: 'long' },
  { label: 'Wire', value: 'wire' },
];

const TRAIT_SLIDERS = [
  { key: 'good_with_children' as const, label: 'Good with Children' },
  { key: 'good_with_dogs' as const, label: 'Good with Dogs' },
  { key: 'good_with_strangers' as const, label: 'Good with Strangers' },
  { key: 'apartment_friendly' as const, label: 'Apartment Friendly' },
  { key: 'energy' as const, label: 'Energy Level' },
  { key: 'trainability' as const, label: 'Trainability' },
];

export const FilterModal: React.FC<Props> = ({
  visible,
  onClose,
  groups,
  currentFilters,
  onApplyFilters,
}) => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const [draft, setDraft] = useState<FilterState>(currentFilters);

  const toggleGroup = (id: string) => {
    setDraft(prev => {
      const exists = prev.selectedGroupIds.includes(id);
      return {
        ...prev,
        selectedGroupIds: exists
          ? prev.selectedGroupIds.filter(g => g !== id)
          : [...prev.selectedGroupIds, id],
      };
    });
  };

  const toggleSize = (size: SizeBand) => {
    setDraft(prev => {
      const exists = prev.selectedSizeBands.includes(size);
      return {
        ...prev,
        selectedSizeBands: exists
          ? prev.selectedSizeBands.filter(s => s !== size)
          : [...prev.selectedSizeBands, size],
      };
    });
  };

  const toggleCoat = (coat: CoatLength) => {
    setDraft(prev => {
      const exists = prev.selectedCoatLengths.includes(coat);
      return {
        ...prev,
        selectedCoatLengths: exists
          ? prev.selectedCoatLengths.filter(c => c !== coat)
          : [...prev.selectedCoatLengths, coat],
      };
    });
  };

  const setHypoallergenic = (val: boolean | null) => {
    setDraft(prev => ({ ...prev, hypoallergenicOnly: val }));
  };

  const setTraitScore = (
    key: keyof FilterState['traitThresholds'],
    score: number | undefined
  ) => {
    setDraft(prev => {
      const newThresholds = { ...prev.traitThresholds };
      if (score === undefined || newThresholds[key] === score) {
        delete newThresholds[key];
      } else {
        newThresholds[key] = score;
      }
      return { ...prev, traitThresholds: newThresholds };
    });
  };

  const handleReset = () => {
    const cleared: FilterState = {
      searchQuery: draft.searchQuery,
      selectedGroupIds: [],
      selectedSizeBands: [],
      selectedCoatLengths: [],
      hypoallergenicOnly: null,
      traitThresholds: {},
    };
    setDraft(cleared);
  };

  const handleApply = () => {
    onApplyFilters(draft);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.surface,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <TouchableOpacity onPress={handleReset} style={styles.headerButton}>
            <Text style={[styles.resetText, { color: theme.textSecondary }]}>
              Reset
            </Text>
          </TouchableOpacity>

          <Text style={[styles.title, { color: theme.textPrimary }]}>
            Filter Breeds
          </Text>

          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={[styles.closeText, { color: theme.primary }]}>
              Done
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Breed Group
            </Text>
            <View style={styles.chipRow}>
              {groups.map(g => {
                const isSelected = draft.selectedGroupIds.includes(g.id);
                return (
                  <TouchableOpacity
                    key={g.id}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : theme.surfaceSubtle,
                        borderColor: isSelected
                          ? theme.primary
                          : theme.border,
                      },
                    ]}
                    onPress={() => toggleGroup(g.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: isSelected ? '#FFFFFF' : theme.textPrimary,
                        },
                      ]}
                    >
                      {g.attributes.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Size Band
            </Text>
            <View style={styles.chipRow}>
              {SIZE_BANDS.map(s => {
                const isSelected = draft.selectedSizeBands.includes(s.value);
                return (
                  <TouchableOpacity
                    key={s.value}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : theme.surfaceSubtle,
                        borderColor: isSelected
                          ? theme.primary
                          : theme.border,
                      },
                    ]}
                    onPress={() => toggleSize(s.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: isSelected ? '#FFFFFF' : theme.textPrimary,
                        },
                      ]}
                    >
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Coat Length
            </Text>
            <View style={styles.chipRow}>
              {COAT_LENGTHS.map(c => {
                const isSelected = draft.selectedCoatLengths.includes(c.value);
                return (
                  <TouchableOpacity
                    key={c.value}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : theme.surfaceSubtle,
                        borderColor: isSelected
                          ? theme.primary
                          : theme.border,
                      },
                    ]}
                    onPress={() => toggleCoat(c.value)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: isSelected ? '#FFFFFF' : theme.textPrimary,
                        },
                      ]}
                    >
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Hypoallergenic
            </Text>
            <View style={styles.segmentContainer}>
              {[
                { label: 'All', value: null },
                { label: 'Yes', value: true },
                { label: 'No', value: false },
              ].map(opt => {
                const isSelected = draft.hypoallergenicOnly === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.label}
                    style={[
                      styles.segmentButton,
                      {
                        backgroundColor: isSelected
                          ? theme.primary
                          : theme.surfaceSubtle,
                      },
                    ]}
                    onPress={() => setHypoallergenic(opt.value)}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        {
                          color: isSelected ? '#FFFFFF' : theme.textPrimary,
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Trait Threshold (Minimum Score)
            </Text>
            {TRAIT_SLIDERS.map(trait => {
              const currentVal = draft.traitThresholds[trait.key];
              return (
                <View key={trait.key} style={styles.traitRow}>
                  <Text
                    style={[styles.traitLabel, { color: theme.textSecondary }]}
                  >
                    {trait.label}
                  </Text>
                  <View style={styles.scoreRow}>
                    {[1, 2, 3, 4, 5].map(score => {
                      const isActive = (currentVal ?? 0) >= score;
                      return (
                        <TouchableOpacity
                          key={score}
                          style={[
                            styles.scoreButton,
                            {
                              backgroundColor: isActive
                                ? theme.accent
                                : theme.surfaceSubtle,
                              borderColor: isActive
                                ? theme.accent
                                : theme.border,
                            },
                          ]}
                          onPress={() => setTraitScore(trait.key, score)}
                        >
                          <Star
                            size={12}
                            color={isActive ? '#FFFFFF' : theme.textMuted}
                            fill={isActive ? '#FFFFFF' : 'none'}
                          />
                          <Text
                            style={[
                              styles.scoreText,
                              {
                                color: isActive
                                  ? '#FFFFFF'
                                  : theme.textPrimary,
                              },
                            ]}
                          >
                            {score}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.surface,
              borderTopColor: theme.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: theme.primary }]}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>
              Apply Filters
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerButton: {
    padding: spacing.xs,
  },
  resetText: {
    fontSize: 14,
    fontWeight: '500',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  traitRow: {
    marginBottom: spacing.md,
  },
  traitLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  scoreButton: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  applyButton: {
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
