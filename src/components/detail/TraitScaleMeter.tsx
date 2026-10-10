import React from 'react';
import {
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { borderRadius, darkTheme, lightTheme, spacing } from '../../theme';

interface Props {
  label: string;
  value: number;
  max?: number;
  unit?: string;
  color?: string;
}

export const TraitScaleMeter: React.FC<Props> = ({
  label,
  value,
  max = 5,
  unit,
  color,
}) => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const barColor = color || theme.primary;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const isMinuteMetric = !!unit;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </Text>
        <Text style={[styles.value, { color: theme.textPrimary }]}>
          {isMinuteMetric ? `${value} ${unit}` : `${value} / ${max}`}
        </Text>
      </View>

      <View
        style={[
          styles.track,
          { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>

      {!isMinuteMetric && (
        <View style={styles.segments}>
          {Array.from({ length: max }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.segmentDot,
                {
                  backgroundColor:
                    i + 1 <= value ? barColor : theme.borderSubtle,
                },
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.pill,
  },
  segments: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 2,
  },
  segmentDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
