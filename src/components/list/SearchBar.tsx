import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { borderRadius, darkTheme, lightTheme, spacing } from '../../theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
  activeFilterCount: number;
}

export const SearchBar: React.FC<Props> = ({
  value,
  onChangeText,
  onFilterPress,
  activeFilterCount,
}) => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;
  const [localText, setLocalText] = useState(value);

  useEffect(() => {
    setLocalText(value);
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localText !== value) {
        onChangeText(localText);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [localText, onChangeText, value]);

  const handleClear = () => {
    setLocalText('');
    onChangeText('');
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.surfaceSubtle,
            borderColor: theme.border,
          },
        ]}
      >
        <Search size={18} color={theme.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.input, { color: theme.textPrimary }]}
          placeholder="Search by breed or alias..."
          placeholderTextColor={theme.textMuted}
          value={localText}
          onChangeText={setLocalText}
          autoCorrect={false}
          returnKeyType="search"
        />
        {localText.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={16} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor:
              activeFilterCount > 0 ? theme.primary : theme.surfaceSubtle,
            borderColor:
              activeFilterCount > 0 ? theme.primary : theme.border,
          },
        ]}
        onPress={onFilterPress}
      >
        <SlidersHorizontal
          size={16}
          color={activeFilterCount > 0 ? '#FFFFFF' : theme.textPrimary}
        />
        <Text
          style={[
            styles.filterText,
            {
              color: activeFilterCount > 0 ? '#FFFFFF' : theme.textPrimary,
            },
          ]}
        >
          Filters
        </Text>
        {activeFilterCount > 0 && (
          <View style={styles.filterBadge}>
            <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    paddingHorizontal: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
});
