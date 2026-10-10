export function formatFreshness(timestamp: number | null): string {
  if (!timestamp) {
    return 'Never synced';
  }

  const now = Date.now();
  const diffSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));

  if (diffSeconds < 60) {
    return 'Synced just now';
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `Last synced ${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `Last synced ${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `Last synced ${diffDays}d ago`;
}
