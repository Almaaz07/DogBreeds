export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSubtle: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  accent: string;
  accentSubtle: string;
  success: string;
  warning: string;
  danger: string;
  cardShadow: string;
}

export const lightTheme: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  accent: '#F59E0B',
  accentSubtle: '#FEF3C7',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  cardShadow: 'rgba(15, 23, 42, 0.06)',
};

export const darkTheme: ThemeColors = {
  background: '#0B1120',
  surface: '#1E293B',
  surfaceSubtle: '#162032',
  surfaceElevated: '#24334A',
  border: '#334155',
  borderSubtle: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#64748B',
  primary: '#3B82F6',
  primaryLight: 'rgba(59, 130, 246, 0.15)',
  accent: '#FBBF24',
  accentSubtle: 'rgba(251, 191, 36, 0.15)',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  pill: 999,
};

export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    hero: 30,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
};
