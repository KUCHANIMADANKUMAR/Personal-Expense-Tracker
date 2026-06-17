import React, { useState } from 'react';
import { Expense, Income, TransactionCategory, UserProfile, CURRENCIES } from '../types';
import { Search, Plus, Trash2, Edit3, ArrowUp, ArrowDown, Tag, Calendar, FileText, Check, X, Filter } from 'lucide-react';
import { getTheme, getCardStyle } from '../utils/theme';

interface TransactionsListProps {
  expenses: Expense[];
  income: Income[];
  profile: UserProfile;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onEditExpense: (id: string, expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
  onAddIncome: (income: Omit<Income, 'id'>) => void;
  onEditIncome: (id: string, income: Omit<Income, 'id'>) => void;
  onDeleteIncome: (id: string) => void;
}

export default function TransactionsList({
  expenses,
  income,
  profile,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onAddIncome,
  onEditIncome,
  onDeleteIncome
}: TransactionsListProps) {
  // UI states
  const [activeTab, setActiveTab] = useState<'all' | 'expense' | 'income'>('all');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Adding state
  const [showAddForm, setShowAddForm] = useState(false);
  const [formType, setFormType] = useState<'expense' | 'income'>('expense');
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormType, setEditFormType] = useState<'expense' | 'income'>('expense');

  // Form Fields
  const [titleOrSource, setTitleOrSource] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const currencySymbol = CURRENCIES[profile.currency]?.symbol || '₹';
  const activeTheme = getTheme(profile);
  const styles = getCardStyle(profile.theme);

  const categories: TransactionCategory[] = [
    'Food', 'Transport', 'Shopping', 'Bills', 'Entertainment',
    'Healthcare', 'Education', 'Travel', 'Investment', 'Other'
  ];

  // Map expenses and incomes into a unified ledger representation
  const ledgerExpenses = expenses.map(e => ({ ...e, type: 'expense' as const }));
  const ledgerIncome = income.map(i => ({ id: i.id, title: i.source, amount: i.amount, category: 'Other' as TransactionCategory, date: i.date, notes: i.notes ?? '', type: 'income' as const }));
  
  const unifiedTransactions = [...ledgerExpenses, ...ledgerIncome].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filter transactions
  const filteredTransactions = unifiedTransactions.filter(t => {
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'expense' && t.type === 'expense') || 
      (activeTab === 'income' && t.type === 'income');
      
    const matchesSearch = 
      t.title.toLowerCase().includes(search.toLowerCase()) || 
      (t.notes || '').toLowerCase().includes(search.toLowerCase());
      
    const matchesCategory = 
      selectedCategory === 'All' || 
      (t.type === 'expense' && t.category === selectedCategory);

    return matchesTab && matchesSearch && matchesCategory;
  });

  // Category Tailwind styler
  const getCategoryStyles = (cat: TransactionCategory) => {
    if (profile.theme === 'dark') {
      switch (cat) {
        case 'Food': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
        case 'Transport': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
        case 'Shopping': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
        case 'Bills': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        case 'Entertainment': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        case 'Healthcare': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
        case 'Education': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'Travel': return 'bg-amber-500/10 text-amber-450 border-amber-500/20';
        case 'Investment': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        default: return 'bg-slate-805 text-slate-300 border-slate-700';
      }
    }
    switch (cat) {
      case 'Food': return 'bg-orange-50 text-orange-750 border-orange-100';
      case 'Transport': return 'bg-cyan-50 text-cyan-750 border-cyan-100';
      case 'Shopping': return 'bg-pink-50 text-pink-750 border-pink-100';
      case 'Bills': return 'bg-rose-50 text-rose-750 border-rose-100';
      case 'Entertainment': return 'bg-purple-50 text-purple-750 border-purple-100';
      case 'Healthcare': return 'bg-teal-50 text-teal-750 border-teal-100';
      case 'Education': return 'bg-blue-50 text-blue-750 border-blue-100';
      case 'Travel': return 'bg-amber-50 text-amber-750 border-amber-100';
      case 'Investment': return 'bg-emerald-50 text-emerald-750 border-emerald-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleOpenAddForm = (type: 'expense' | 'income') => {
    setFormType(type);
    setTitleOrSource('');
    setAmount('');
    setCategory('Food');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setEditingId(null);
    setShowAddForm(true);
  };

  const handleOpenEdit = (t: typeof unifiedTransactions[number]) => {
    setEditingId(t.id);
    setEditFormType(t.type);
    setTitleOrSource(t.title);
    setAmount(t.amount.toString());
    setCategory(t.category);
    setDate(t.date);
    setNotes(t.notes || '');
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please provide a valid transaction amount.');
      return;
    }

    if (editingId) {
      // Edit mode
      if (editFormType === 'expense') {
        onEditExpense(editingId, {
          title: titleOrSource,
          amount: parsedAmount,
          category,
          date,
          notes: notes || undefined
        });
      } else {
        onEditIncome(editingId, {
          source: titleOrSource,
          amount: parsedAmount,
          date,
          notes: notes || undefined
        });
      }
    } else {
      // Add mode
      if (formType === 'expense') {
        onAddExpense({
          title: titleOrSource,
          amount: parsedAmount,
          category,
          date,
          notes: notes || undefined
        });
      } else {
        onAddIncome({
          source: titleOrSource,
          amount: parsedAmount,
          date,
          notes: notes || undefined
        });
      }
    }

    setShowAddForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string, type: 'expense' | 'income') => {
    if (confirm(`Purge this ${type} record permanently?`)) {
      if (type === 'expense') {
        onDeleteExpense(id);
      } else {
        onDeleteIncome(id);
      }
    }
  };  return (
    <div className="max-w-4xl mx-auto space-y-6" id="transactions-ledger">
      {/* Search and Buttons bar */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${styles.bg} p-5`}>
        {/* Tab Selection */}
        <div className={`flex ${profile.theme === 'dark' ? 'bg-slate-950/40' : 'bg-gray-100/50'} p-1 rounded-xl`}>
          <button
            onClick={() => { setActiveTab('all'); setSelectedCategory('All'); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === 'all'
                ? (profile.theme === 'dark' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-gray-900 shadow-xs')
                : 'text-gray-400 hover:text-gray-950'
            }`}
          >
            Unified Ledger
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === 'expense'
                ? (profile.theme === 'dark' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-gray-900 shadow-xs')
                : 'text-gray-400 hover:text-gray-950'
            }`}
          >
            Expenses Only
          </button>
          <button
            onClick={() => { setActiveTab('income'); setSelectedCategory('All'); }}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === 'income'
                ? (profile.theme === 'dark' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-gray-900 shadow-xs')
                : 'text-gray-400 hover:text-gray-950'
            }`}
          >
            Incomes Only
          </button>
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenAddForm('expense')}
            className={`flex-1 md:flex-none px-4 py-2.5 ${activeTheme.primaryBg} ${activeTheme.primaryHoverBg} text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs`}
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => handleOpenAddForm('income')}
            className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Full Query Input */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 ${styles.input} font-medium`}
            placeholder="Search transactions by title, note details..."
          />
        </div>

        {/* Category Selective Filter (Expense only) */}
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            disabled={activeTab === 'income'}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`w-full pl-10 pr-8 py-2.5 ${styles.input} font-medium appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <option value="All" className={profile.theme === 'dark' ? 'bg-slate-900 text-white' : ''}>All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat} className={profile.theme === 'dark' ? 'bg-slate-900 text-white' : ''}>{cat}</option>
            ))}
          </select>
          <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400 font-extrabold text-[10px]">▼</div>
        </div>
      </div>

      {/* Transaction list element */}
      <div className={`${styles.bg} overflow-hidden`}>
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <Tag className="w-8 h-8 mx-auto stroke-1 text-slate-300" />
            <p className="font-medium text-sm text-gray-600">No transactions match your filters.</p>
            <p className="text-xs">Adjust your search parameters or select a different category filter.</p>
          </div>
        ) : (
          <div className={`divide-y ${styles.divider}`}>
            {filteredTransactions.map((t) => (
              <div
                key={`${t.type}-${t.id}`}
                className={`p-5 flex items-center justify-between ${profile.theme === 'dark' ? 'hover:bg-slate-800/20' : 'hover:bg-gray-50/50'} transition-colors gap-4`}
              >
                {/* Visual Circle Indicator */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    t.type === 'expense' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {t.type === 'expense' ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0 space-y-1">
                    <p className={`font-bold text-sm truncate ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t.title}</p>
                    
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {t.date}
                      </span>
                      {t.type === 'expense' && (
                        <span className={`px-2 py-0.5 border text-[10px] font-bold rounded-md ${getCategoryStyles(t.category)}`}>
                          {t.category}
                        </span>
                      )}
                      {t.notes && (
                        <span className={`flex items-center gap-1 max-w-[200px] truncate text-gray-400 ${profile.theme === 'dark' ? 'bg-slate-950/60' : 'bg-gray-50'} px-1.5 py-0.5 rounded-sm text-[10px]`}>
                          <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                          {t.notes}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price and actions */}
                <div className="flex items-center gap-6 shrink-0">
                  <span className={`font-mono font-bold text-sm leading-none ${
                    t.type === 'expense'
                      ? (profile.theme === 'dark' ? 'text-rose-400' : 'text-gray-950')
                      : 'text-emerald-500'
                  }`}>
                    {t.type === 'expense' ? '-' : '+'}{currencySymbol}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>

                  <div className={`flex items-center gap-1.5 border-l ${styles.divider} pl-4`}>
                    <button
                      onClick={() => handleOpenEdit(t)}
                      aria-label="Edit transaction"
                      className={`p-1.5 rounded-lg text-gray-400 ${profile.theme === 'dark' ? 'hover:text-indigo-400 hover:bg-slate-800' : 'hover:text-indigo-650 hover:bg-indigo-50'} transition-colors`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id, t.type)}
                      aria-label="Delete transaction"
                      className={`p-1.5 rounded-lg text-gray-400 ${profile.theme === 'dark' ? 'hover:text-rose-400 hover:bg-slate-800' : 'hover:text-rose-650 hover:bg-rose-50'} transition-colors`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Form Overlay Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className={`${profile.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-2xl max-w-md w-full shadow-2xl border overflow-hidden transform scale-100 transition-all`}>
            <div className={`px-6 py-5 ${profile.theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-gray-100/80'} border-b flex items-center justify-between`}>
              <h3 className={`font-bold text-sm uppercase tracking-wider ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {editingId 
                  ? `Edit ${editFormType === 'expense' ? 'Expense' : 'Income'} Record` 
                  : `Add New ${formType === 'expense' ? 'Expense' : 'Income'}`
                }
              </h3>
              <button 
                onClick={() => { setShowAddForm(false); setEditingId(null); }}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-150 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-1.5">
                  {(editingId ? editFormType : formType) === 'expense' ? 'Expense Designation (Title)' : 'Income Source'}
                </label>
                <input
                  type="text"
                  required
                  value={titleOrSource}
                  onChange={(e) => setTitleOrSource(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold ${styles.input}`}
                  placeholder="e.g. Sainsbury Groceries, Tech Salary payout..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-1.5">Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-semibold ${styles.input}`}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-1.5">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold ${styles.input}`}
                  />
                </div>
              </div>

              {(editingId ? editFormType : formType) === 'expense' && (
                <div>
                  <label className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-1.5">Transaction Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${styles.input}`}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className={profile.theme === 'dark' ? 'bg-slate-900 text-white' : ''}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-450 uppercase tracking-wider mb-1.5">Memo / Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold ${styles.input}`}
                  placeholder="Purchase specifications, metadata..."
                />
              </div>

              <div className={`flex items-center justify-end gap-3 pt-4 border-t ${styles.divider}`}>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setEditingId(null); }}
                  className={`px-4.5 py-2 ${profile.theme === 'dark' ? 'bg-slate-950 hover:bg-slate-800 text-slate-400' : 'bg-gray-50 hover:bg-gray-100 text-gray-600'} rounded-xl text-xs font-semibold transition-all`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 ${activeTheme.primaryBg} ${activeTheme.primaryHoverBg} text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all`}
                >
                  Confirm Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
