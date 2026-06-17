import { LanguageType } from './utils/translations';

export type CurrencyType = 'INR' | 'PKR' | 'BDT' | 'LKR' | 'NPR' | 'BTN' | 'MMK' | 'MVR' | 'AFN' | 'CNY';

export interface CurrencyConfig {
  code: CurrencyType;
  symbol: string;
  name: string;
  country: string;
}

export const CURRENCIES: Record<CurrencyType, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India' },
  PKR: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', country: 'Pakistan' },
  BDT: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', country: 'Bangladesh' },
  LKR: { code: 'LKR', symbol: 'රු', name: 'Sri Lankan Rupee', country: 'Sri Lanka' },
  NPR: { code: 'NPR', symbol: '₨', name: 'Nepalese Rupee', country: 'Nepal' },
  BTN: { code: 'BTN', symbol: 'Nu.', name: 'Bhutanese Ngultrum', country: 'Bhutan' },
  MMK: { code: 'MMK', symbol: 'Ks', name: 'Myanma Kyat', country: 'Myanmar' },
  MVR: { code: 'MVR', symbol: 'Rf', name: 'Maldivian Rufiyaa', country: 'Maldives' },
  AFN: { code: 'AFN', symbol: '؋', name: 'Afghan Afghani', country: 'Afghanistan' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', country: 'China' }
};

export type TransactionCategory =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Healthcare'
  | 'Education'
  | 'Travel'
  | 'Investment'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: TransactionCategory;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface Income {
  id: string;
  source: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface Budget {
  category: TransactionCategory;
  limit: number;
}

export interface SavingsGoal {
  id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  deadline: string; // YYYY-MM-DD
}

export interface UserProfile {
  name: string;
  email: string;
  currency: CurrencyType;
  language: LanguageType;
  theme: 'light' | 'dark';
  themeColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet' | 'slate' | 'teal';
  monthlyIncomeSetting: number;
  avatarUrl?: string;
}

export interface SmartAlert {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface GeminiAdvice {
  healthScore: number; // 0-100
  highestCategory: string;
  spendingChangePercent: number; // e.g. +5% or -12% compared to budget/last periods
  recommendations: string[];
  summary: string;
}
