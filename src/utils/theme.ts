import { UserProfile } from '../types';

export type ThemeColor = 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet' | 'teal';

export interface ThemeColors {
  name: string;
  color: ThemeColor;
  primaryBg: string;
  primaryHoverBg: string;
  primaryActiveBg: string;
  primaryText: string;
  primaryTextHover: string;
  primaryBorder: string;
  lightBg: string;
  lightBgHover: string;
  lightText: string;
  borderPrimary: string;
  borderFocus: string;
  ringColor: string;
  badgeBg: string;
  tintText: string;
  gradientTo: string;
  pulseRing: string;
  accentBg: string;
  dotColor: string;
}

export const THEME_COLORS: Record<ThemeColor, ThemeColors> = {
  indigo: {
    name: 'Cosmic Indigo',
    color: 'indigo',
    primaryBg: 'bg-indigo-600',
    primaryHoverBg: 'hover:bg-indigo-700',
    primaryActiveBg: 'active:bg-indigo-800',
    primaryText: 'text-indigo-600',
    primaryTextHover: 'hover:text-indigo-600',
    primaryBorder: 'border-indigo-600',
    lightBg: 'bg-indigo-50/70',
    lightBgHover: 'hover:bg-indigo-100/70',
    lightText: 'text-indigo-700',
    borderPrimary: 'border-indigo-100',
    borderFocus: 'focus:border-indigo-500 focus:ring-indigo-500/10',
    ringColor: 'ring-indigo-500',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    tintText: 'text-indigo-750',
    gradientTo: 'from-indigo-600 to-indigo-500',
    pulseRing: 'ring-indigo-500/10',
    accentBg: 'bg-indigo-950/20',
    dotColor: 'bg-indigo-500'
  },
  emerald: {
    name: 'Financial Emerald',
    color: 'emerald',
    primaryBg: 'bg-emerald-600',
    primaryHoverBg: 'hover:bg-emerald-700',
    primaryActiveBg: 'active:bg-emerald-800',
    primaryText: 'text-emerald-600',
    primaryTextHover: 'hover:text-emerald-600',
    primaryBorder: 'border-emerald-600',
    lightBg: 'bg-emerald-50/70',
    lightBgHover: 'hover:bg-emerald-100/70',
    lightText: 'text-emerald-700',
    borderPrimary: 'border-emerald-100',
    borderFocus: 'focus:border-emerald-500 focus:ring-emerald-500/10',
    ringColor: 'ring-emerald-500',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    tintText: 'text-emerald-800',
    gradientTo: 'from-emerald-650 to-emerald-500',
    pulseRing: 'ring-emerald-500/10',
    accentBg: 'bg-emerald-950/20',
    dotColor: 'bg-emerald-500'
  },
  amber: {
    name: 'Electric Amber',
    color: 'amber',
    primaryBg: 'bg-amber-500',
    primaryHoverBg: 'hover:bg-amber-600',
    primaryActiveBg: 'active:bg-amber-700',
    primaryText: 'text-amber-600',
    primaryTextHover: 'hover:text-amber-600',
    primaryBorder: 'border-amber-500',
    lightBg: 'bg-amber-50/70',
    lightBgHover: 'hover:bg-amber-100/70',
    lightText: 'text-amber-800',
    borderPrimary: 'border-amber-100',
    borderFocus: 'focus:border-amber-500 focus:ring-amber-500/10',
    ringColor: 'ring-amber-500',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-100',
    tintText: 'text-amber-800',
    gradientTo: 'from-amber-500 to-amber-400',
    pulseRing: 'ring-amber-500/10',
    accentBg: 'bg-amber-950/20',
    dotColor: 'bg-amber-500'
  },
  rose: {
    name: 'Dynamic Rose',
    color: 'rose',
    primaryBg: 'bg-rose-600',
    primaryHoverBg: 'hover:bg-rose-700',
    primaryActiveBg: 'active:bg-rose-800',
    primaryText: 'text-rose-600',
    primaryTextHover: 'hover:text-rose-600',
    primaryBorder: 'border-rose-600',
    lightBg: 'bg-rose-50/70',
    lightBgHover: 'hover:bg-rose-100/70',
    lightText: 'text-rose-700',
    borderPrimary: 'border-rose-100',
    borderFocus: 'focus:border-rose-500 focus:ring-rose-500/10',
    ringColor: 'ring-rose-500',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-100',
    tintText: 'text-rose-750',
    gradientTo: 'from-rose-600 to-rose-500',
    pulseRing: 'ring-rose-500/10',
    accentBg: 'bg-rose-950/20',
    dotColor: 'bg-rose-500'
  },
  violet: {
    name: 'Royal Violet',
    color: 'violet',
    primaryBg: 'bg-violet-600',
    primaryHoverBg: 'hover:bg-violet-700',
    primaryActiveBg: 'active:bg-violet-800',
    primaryText: 'text-violet-600',
    primaryTextHover: 'hover:text-violet-600',
    primaryBorder: 'border-violet-600',
    lightBg: 'bg-violet-50/70',
    lightBgHover: 'hover:bg-violet-100/70',
    lightText: 'text-violet-700',
    borderPrimary: 'border-violet-100',
    borderFocus: 'focus:border-violet-500 focus:ring-violet-500/10',
    ringColor: 'ring-violet-500',
    badgeBg: 'bg-violet-50 text-violet-700 border-violet-100',
    tintText: 'text-violet-750',
    gradientTo: 'from-violet-600 to-violet-500',
    pulseRing: 'ring-violet-500/10',
    accentBg: 'bg-violet-950/20',
    dotColor: 'bg-violet-500'
  },
  teal: {
    name: 'Ocean Teal',
    color: 'teal',
    primaryBg: 'bg-teal-600',
    primaryHoverBg: 'hover:bg-teal-700',
    primaryActiveBg: 'active:bg-teal-800',
    primaryText: 'text-teal-600',
    primaryTextHover: 'hover:text-teal-600',
    primaryBorder: 'border-teal-600',
    lightBg: 'bg-teal-50/70',
    lightBgHover: 'hover:bg-teal-100/70',
    lightText: 'text-teal-700',
    borderPrimary: 'border-teal-100',
    borderFocus: 'focus:border-teal-500 focus:ring-teal-500/10',
    ringColor: 'ring-teal-500',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-100',
    tintText: 'text-teal-750',
    gradientTo: 'from-teal-600 to-teal-500',
    pulseRing: 'ring-teal-500/10',
    accentBg: 'bg-teal-950/20',
    dotColor: 'bg-teal-505'
  }
};

export function getTheme(profile: Partial<UserProfile> | undefined): ThemeColors {
  const color = (profile?.themeColor as ThemeColor) || 'indigo';
  return THEME_COLORS[color] || THEME_COLORS.indigo;
}

export interface CardStyles {
  bg: string;
  border: string;
  textTitle: string;
  textBody: string;
  subcard: string;
  input: string;
  divider: string;
}

export function getCardStyle(theme: 'light' | 'dark' | undefined): CardStyles {
  const isDark = theme === 'dark';
  if (isDark) {
    return {
      bg: 'bg-slate-900/80 backdrop-blur-md border border-slate-800/80 shadow-2xl shadow-slate-950/40 rounded-2xl',
      border: 'border border-slate-800/80',
      textTitle: 'text-white font-extrabold tracking-tight',
      textBody: 'text-slate-400 font-semibold',
      subcard: 'bg-slate-950/50 border border-slate-800/50 rounded-2xl',
      input: 'bg-slate-950/60 border border-slate-800/80 placeholder-slate-500 text-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl transition-all',
      divider: 'border-slate-800/50'
    };
  } else {
    // Beautiful classy cream-colored minimal linen theme
    return {
      bg: 'bg-white border border-slate-100 hover:border-slate-200/80 shadow-[0_6px_20px_rgba(15,23,42,0.025)] rounded-2xl transition-all',
      border: 'border border-slate-100',
      textTitle: 'text-slate-900 font-extrabold tracking-tight',
      textBody: 'text-slate-550 font-semibold',
      subcard: 'bg-slate-50/70 border border-slate-100 rounded-xl',
      input: 'bg-slate-50/50 border border-slate-200 placeholder-gray-400 text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl transition-all',
      divider: 'border-gray-100/80'
    };
  }
}
