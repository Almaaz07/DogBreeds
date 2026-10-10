import { formatFreshness } from '../utils/freshness';

describe('formatFreshness', () => {
  it('returns "Never synced" when timestamp is null', () => {
    expect(formatFreshness(null)).toBe('Never synced');
  });

  it('returns "Synced just now" when diff is under 60 seconds', () => {
    const now = Date.now();
    expect(formatFreshness(now - 10000)).toBe('Synced just now');
  });

  it('formats minutes correctly', () => {
    const now = Date.now();
    expect(formatFreshness(now - 5 * 60 * 1000)).toBe('Last synced 5m ago');
  });

  it('formats hours correctly', () => {
    const now = Date.now();
    expect(formatFreshness(now - 3 * 3600 * 1000)).toBe('Last synced 3h ago');
  });

  it('formats days correctly', () => {
    const now = Date.now();
    expect(formatFreshness(now - 2 * 86400 * 1000)).toBe('Last synced 2d ago');
  });
});
