import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { darkTheme, lightTheme, spacing } from '../../theme';
import { formatFreshness } from '../../utils/freshness';

interface Props {
  isOffline: boolean;
  isSyncing: boolean;
  lastSyncTimestamp: number | null;
  onRefreshPress?: () => void;
}

export const SyncFreshnessBanner: React.FC<Props> = ({
  isOffline,
  isSyncing,
  lastSyncTimestamp,
  onRefreshPress,
}) => {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  const freshnessText = formatFreshness(lastSyncTimestamp);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isOffline
            ? isDark
              ? '#3E2415'
              : '#FEF3C7'
            : theme.surfaceSubtle,
          borderColor: isOffline
            ? isDark
              ? '#78350F'
              : '#FDE68A'
            : theme.borderSubtle,
        },
      ]}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.dot,
            {
              backgroundColor: isOffline
                ? '#F59E0B'
                : isSyncing
                ? '#3B82F6'
                : '#10B981',
            },
          ]}
        />
        <Text
          style={[
            styles.statusText,
            {
              color: isOffline
                ? isDark
                  ? '#FDE68A'
                  : '#92400E'
                : theme.textSecondary,
            },
          ]}
        >
          {isOffline
            ? 'Offline • Using cached data'
            : isSyncing
            ? 'Syncing 283 breeds...'
            : freshnessText}
        </Text>
      </View>

      {isSyncing ? (
        <ActivityIndicator size="small" color={theme.primary} />
      ) : (
        onRefreshPress &&
        !isOffline && (
          <TouchableOpacity onPress={onRefreshPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.actionText, { color: theme.primary }]}>
              Sync now
            </Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
