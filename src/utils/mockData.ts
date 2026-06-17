import { Expense, Income, Budget, SavingsGoal, UserProfile, SmartAlert } from '../types';

export const INITIAL_PROFILE: UserProfile = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  currency: 'INR',
  language: 'en',
  theme: 'light',
  themeColor: 'indigo',
  monthlyIncomeSetting: 125000,
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
};

export const INITIAL_BUDGETS: Budget[] = [
  { category: 'Food', limit: 600 },
  { category: 'Transport', limit: 300 },
  { category: 'Shopping', limit: 500 },
  { category: 'Bills', limit: 1200 },
  { category: 'Entertainment', limit: 400 },
  { category: 'Healthcare', limit: 200 },
  { category: 'Education', limit: 150 },
  { category: 'Travel', limit: 800 },
  { category: 'Investment', limit: 1000 },
  { category: 'Other', limit: 300 }
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    goal_name: 'Emergency Fund',
    target_amount: 15000,
    current_amount: 8500,
    deadline: '2026-12-31'
  },
  {
    id: 'goal-2',
    goal_name: 'Tokyo Vacation',
    target_amount: 5000,
    current_amount: 2200,
    deadline: '2026-10-15'
  },
  {
    id: 'goal-3',
    goal_name: 'New Macbook Pro 16',
    target_amount: 2500,
    current_amount: 1800,
    deadline: '2026-07-30'
  }
];

export const INITIAL_INCOMES: Income[] = [
  {
    id: 'inc-1',
    source: 'TechCorp Salary',
    amount: 5200,
    date: '2026-06-01',
    notes: 'Primary monthly payout'
  },
  {
    id: 'inc-2',
    source: 'Vercel Side Project Sales',
    amount: 850,
    date: '2026-06-08',
    notes: 'Micro-SaaS subscriber payments'
  },
  {
    id: 'inc-3',
    source: 'S&P 500 Dividend payout',
    amount: 240,
    date: '2026-06-12',
    notes: 'Quarterly brokerage dividend'
  },
  // Previous Month
  {
    id: 'inc-4',
    source: 'TechCorp Salary',
    amount: 5200,
    date: '2026-05-01',
    notes: 'Primary monthly payout'
  },
  {
    id: 'inc-5',
    source: 'Vercel Side Project Sales',
    amount: 920,
    date: '2026-05-08',
    notes: 'Micro-SaaS subscriber payments'
  },
  // Older Payouts
  {
    id: 'inc-6',
    source: 'TechCorp Salary',
    amount: 5200,
    date: '2026-04-01',
    notes: 'Primary monthly payout'
  },
  {
    id: 'inc-7',
    source: 'Vercel Side Project Sales',
    amount: 750,
    date: '2026-04-08',
    notes: 'Micro-SaaS subscriber payments'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  // June 2026 (Current Month)
  {
    id: 'exp-1',
    title: 'Whole Foods Market',
    amount: 184.5,
    category: 'Food',
    date: '2026-06-02',
    notes: 'Weekly organic groceries'
  },
  {
    id: 'exp-2',
    title: 'AWS Cloud Server Hosting',
    amount: 45.0,
    category: 'Bills',
    date: '2026-06-03',
    notes: 'App startup background infra'
  },
  {
    id: 'exp-3',
    title: 'Shell Gas Refill',
    amount: 54.0,
    category: 'Transport',
    date: '2026-06-04',
    notes: 'Full tank of fuel'
  },
  {
    id: 'exp-4',
    title: 'Netflix Premium subscription',
    amount: 22.99,
    category: 'Entertainment',
    date: '2026-06-05',
    notes: 'Family plan auto-renew'
  },
  {
    id: 'exp-5',
    title: 'Patagonia Rain Jacket',
    amount: 149.0,
    category: 'Shopping',
    date: '2026-06-07',
    notes: 'Purchased for upcoming Tokyo trip'
  },
  {
    id: 'exp-6',
    title: 'City Apt Rent payment',
    amount: 1100.0,
    category: 'Bills',
    date: '2026-06-01',
    notes: 'Monthly overhead'
  },
  {
    id: 'exp-7',
    title: 'Sushi House Dinner',
    amount: 88.0,
    category: 'Food',
    date: '2026-06-09',
    notes: 'Dinner date with team members'
  },
  {
    id: 'exp-8',
    title: 'Monthly Dental checkup',
    amount: 120.0,
    category: 'Healthcare',
    date: '2026-06-10',
    notes: 'Insurance co-pay'
  },
  {
    id: 'exp-9',
    title: 'Uber rides',
    amount: 32.5,
    category: 'Transport',
    date: '2026-06-11',
    notes: 'Commute back from medical clinic'
  },
  {
    id: 'exp-10',
    title: 'AI Trading Investment',
    amount: 500.0,
    category: 'Investment',
    date: '2026-06-12',
    notes: 'Automated index index fund deposit'
  },
  {
    id: 'exp-11',
    title: 'Kindle Books purchase',
    amount: 18.2,
    category: 'Education',
    date: '2026-06-13',
    notes: 'Clean Code principles and psychology of money'
  },
  {
    id: 'exp-12',
    title: 'Electric & Heating bill',
    amount: 145.0,
    category: 'Bills',
    date: '2026-06-14',
    notes: 'Utility co payments'
  },

  // May 2026 Expenses (Previous Month)
  {
    id: 'exp-20',
    title: 'City Apt Rent payment',
    amount: 1100.0,
    category: 'Bills',
    date: '2026-05-01'
  },
  {
    id: 'exp-21',
    title: 'Trader Joe Groceries',
    amount: 165.2,
    category: 'Food',
    date: '2026-05-04'
  },
  {
    id: 'exp-22',
    title: 'Amazon Prime Yearly',
    amount: 139.0,
    category: 'Bills',
    date: '2026-05-06'
  },
  {
    id: 'exp-23',
    title: 'Zara Summer Wear',
    amount: 220.0,
    category: 'Shopping',
    date: '2026-05-12'
  },
  {
    id: 'exp-24',
    title: 'Uber Eats delivery',
    amount: 45.6,
    category: 'Food',
    date: '2026-05-15'
  },
  {
    id: 'exp-25',
    title: 'Train ticket',
    amount: 72.0,
    category: 'Transport',
    date: '2026-05-18'
  },
  {
    id: 'exp-26',
    title: 'Concert tickets',
    amount: 180.0,
    category: 'Entertainment',
    date: '2026-05-22'
  },
  {
    id: 'exp-27',
    title: 'Vanguard Index ETF Fund',
    amount: 800.0,
    category: 'Investment',
    date: '2026-05-25'
  },

  // April 2026 Expenses
  {
    id: 'exp-30',
    title: 'City Apt Rent payment',
    amount: 1100.0,
    category: 'Bills',
    date: '2026-04-01'
  },
  {
    id: 'exp-31',
    title: 'Supermarket supplies',
    amount: 250.0,
    category: 'Food',
    date: '2026-04-03'
  },
  {
    id: 'exp-32',
    title: 'Apple Music Sub',
    amount: 10.99,
    category: 'Entertainment',
    date: '2026-04-12'
  },
  {
    id: 'exp-33',
    title: 'Gym Membership renewal',
    amount: 80.0,
    category: 'Healthcare',
    date: '2026-04-14'
  },
  {
    id: 'exp-34',
    title: 'Udemy React course',
    amount: 15.0,
    category: 'Education',
    date: '2026-04-18'
  },
  {
    id: 'exp-35',
    title: 'Vanguard Index ETF Fund',
    amount: 800.0,
    category: 'Investment',
    date: '2026-04-25'
  },
  {
    id: 'exp-36',
    title: 'Weekend flight get-away',
    amount: 340.0,
    category: 'Travel',
    date: '2026-04-28'
  }
];

export const INITIAL_ALERTS: SmartAlert[] = [
  {
    id: 'alert-1',
    type: 'success',
    title: 'SaaS Milestone Achieved!',
    message: 'Your Side Project revenue increased by 15% this month compared to May.',
    timestamp: '2026-06-08T10:00:00Z',
    read: false
  },
  {
    id: 'alert-2',
    type: 'warning',
    title: 'Food Budget Alert',
    message: 'You have utilized 85% ($510 / $600) of your Food budget for June with 14 days remaining.',
    timestamp: '2026-06-12T14:30:00Z',
    read: false
  },
  {
    id: 'alert-3',
    type: 'info',
    title: 'Goal Target Reached Closer',
    message: 'Your Macau laptop savings is now at 72% ($1800/$2500). Expected date: Late July.',
    timestamp: '2026-06-13T09:15:00Z',
    read: true
  }
];
