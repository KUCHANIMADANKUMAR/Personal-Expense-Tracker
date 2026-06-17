import React, { useState } from 'react';
import { Budget, Expense, TransactionCategory, UserProfile, CURRENCIES } from '../types';
import { ShieldAlert, PiggyBank, Plus, TrendingUp, Sparkles, Check, Settings2, Trash2 } from 'lucide-react';
import { getTheme, getCardStyle } from '../utils/theme';

interface CategoryBudgetsProps {
  budgets: Budget[];
  expenses: Expense[];
  profile: UserProfile;
  onSetBudget: (category: TransactionCategory, limit: number) => void;
  onDeleteBudget: (category: TransactionCategory) => void;
}

export default function CategoryBudgets({ budgets, expenses, profile, onSetBudget, onDeleteBudget }: CategoryBudgetsProps) {
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>('Food');
  const [limit, setLimit] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const currencySymbol = CURRENCIES[profile.currency]?.symbol || '₹';
  const activeTheme = getTheme(profile);
  const styles = getCardStyle(profile.theme);

  const categories: TransactionCategory[] = [
    'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment',
    'Healthcare', 'Education', 'Travel', 'Investment', 'Other'
  ];

  // Calculate total spent per category for the current active month (e.g., June 2026)
  // Let's filter expenses to the exact month of June 2026 for budget comparison (e.g. date starts with '2026-06')
  const getCurrentMonthSpent = (cat: TransactionCategory) => {
    return expenses
      .filter(e => e.category === cat && e.date.startsWith('2026-06'))
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLimit = parseFloat(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      alert('Provide a valid non-zero limit.');
      return;
    }

    onSetBudget(selectedCategory, parsedLimit);
    setShowSuccess(true);
    setLimit('');
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Find overall allocations statistics
  const totalAllocated = budgets.reduce((sum, item) => sum + item.limit, 0);
  const activeMonthSpentAll = expenses
    .filter(e => e.date.startsWith('2026-06'))
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="budget-planner">
      {/* Overview Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className={`${styles.bg} p-5`}>
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Overall Allocated Limits</span>
          <span className={`block text-xl font-extrabold mt-1 ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {currencySymbol}{totalAllocated.toLocaleString(undefined, { minimumFractionDigits: 0 })}
          </span>
          <p className="text-xs text-gray-400 mt-1">Combined monthly category allowances</p>
        </div>

        <div className={`${styles.bg} p-5`}>
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Current Month Spent</span>
          <span className={`block text-xl font-extrabold mt-1 ${activeTheme.primaryText}`}>
            {currencySymbol}{activeMonthSpentAll.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <p className="text-xs text-gray-400 mt-1">Total outflow tracked for June 2026</p>
        </div>

        <div className={`${styles.bg} p-5`}>
          <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Budget Headroom</span>
          <span className={`block text-xl font-extrabold mt-1 ${
            totalAllocated - activeMonthSpentAll >= 0 ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            {currencySymbol}{(totalAllocated - activeMonthSpentAll).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
          <p className="text-xs text-gray-400 mt-1">Total remaining overall allowance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Set budget limits Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className={`${styles.bg} p-6`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${profile.theme === 'dark' ? 'text-white' : 'text-gray-950'}`}>
              <Settings2 className={`w-4 h-4 ${activeTheme.primaryText}`} />
              Configure Budget Caps
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as TransactionCategory)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${styles.input}`}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} className={profile.theme === 'dark' ? 'bg-slate-900 text-white' : ''}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Monthly Limit ({currencySymbol})</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-semibold ${styles.input}`}
                  placeholder="e.g. 500"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 ${activeTheme.primaryBg} ${activeTheme.primaryHoverBg} text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2`}
              >
                <Plus className="w-4 h-4" />
                <span>Assign budget limit</span>
              </button>

              {showSuccess && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-500 text-[11px] font-medium animate-fadeIn">
                  <Check className="w-3.5 h-3.5" />
                  <span>Limit assigned successfully.</span>
                </div>
              )}
            </form>
          </div>

          {/* Quick saving recommendations */}
          <div className={`${profile.theme === 'dark' ? 'bg-emerald-950/20 border border-emerald-500/25 text-slate-300' : 'bg-emerald-50/30 border border-emerald-150 text-slate-800'} p-5 rounded-2xl`}>
            <div className="flex gap-3">
              <PiggyBank className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="space-y-1">
                <h4 className={`font-bold text-xs ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Pacing advice</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                  Financial standards suggest allocating no more than 30% of monthly income to discretionary categories (Entertainment, Travel, Shopping), reserving 50% for core bills and 20% for savings goals.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Progress tracker */}
        <div className={`lg:col-span-2 ${styles.bg} p-6 space-y-6`}>
          <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center justify-between ${profile.theme === 'dark' ? 'text-white' : 'text-gray-950'}`}>
            <span>Category Trackers (June 2026)</span>
            <span className="text-xs text-gray-400 capitalize tracking-normal font-normal">Limits vs Active Spending</span>
          </h3>

          {budgets.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <p className="font-semibold text-sm">No category budgets created yet.</p>
              <p className="text-xs mt-1">Configure your first budget cap in the left panel to begin.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {budgets.map((b) => {
                const spent = getCurrentMonthSpent(b.category);
                const ratio = b.limit > 0 ? (spent / b.limit) * 100 : 0;
                const remaining = b.limit - spent;

                // Color selectors
                const isDark = profile.theme === 'dark';
                let barColor = 'bg-emerald-500';
                let textColor = isDark ? 'text-emerald-400' : 'text-emerald-700';
                let cardBorder = isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-white/50';

                if (ratio >= 100) {
                  barColor = 'bg-rose-500';
                  textColor = isDark ? 'text-rose-450' : 'text-rose-700';
                  cardBorder = isDark ? 'border-rose-500/20 bg-rose-500/10' : 'border-rose-100 bg-rose-50/10';
                } else if (ratio >= 85) {
                  barColor = 'bg-amber-500';
                  textColor = isDark ? 'text-amber-455' : 'text-amber-700';
                  cardBorder = isDark ? 'border-amber-500/20 bg-amber-500/10' : 'border-amber-100 bg-amber-50/5';
                }

                return (
                  <div key={b.category} className={`p-4 rounded-xl border ${cardBorder} space-y-2.5 transition-all`}>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className={`font-bold text-sm leading-none ${isDark ? 'text-white' : 'text-gray-950'}`}>{b.category}</span>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 leading-none mt-0.5">
                          <span>Spent: {currencySymbol}{spent.toFixed(2)}</span>
                          <span>•</span>
                          <span>Limit: {currencySymbol}{b.limit.toFixed(0)}</span>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        <div className="space-y-1">
                          <span className={`block font-semibold text-xs leading-none ${textColor}`}>
                            {ratio.toFixed(0)}% Used
                          </span>
                          <span className="block text-[10px] text-gray-400 font-medium">
                            {remaining >= 0 ? `${currencySymbol}${remaining.toFixed(0)} left` : `${currencySymbol}${Math.abs(remaining).toFixed(0)} overLimit`}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm(`Remove the ${b.category} budget limit allocation?`)) {
                              onDeleteBudget(b.category);
                            }
                          }}
                          className={`p-1.5 rounded-lg text-gray-400 ${isDark ? 'hover:text-red-400 hover:bg-slate-850' : 'hover:text-red-650 hover:bg-red-50'} transition-colors`}
                          title="Delete limit"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress slider bar */}
                    <div className={`w-full ${isDark ? 'bg-slate-950' : 'bg-slate-100'} h-2 rounded-full overflow-hidden`}>
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(100, ratio)}%` }}
                      />
                    </div>

                    {/* Overlimit Warning Overlay banner */}
                    {ratio >= 100 && (
                      <div className={`px-3 py-1.5 ${isDark ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-rose-50 border border-rose-100 text-rose-700'} rounded-lg flex items-center gap-1.5 text-[10px] animate-fadeIn`}>
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="font-semibold">Urgent limit breached: Restrict spending in this segment!</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
