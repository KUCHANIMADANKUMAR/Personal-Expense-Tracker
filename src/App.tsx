import React, { useState, useEffect } from 'react';
import { 
  Expense, 
  Income, 
  Budget, 
  SavingsGoal, 
  UserProfile as ProfileType, 
  SmartAlert, 
  CURRENCIES 
} from './types';
import { getTranslation } from './utils/translations';
import { getTheme, getCardStyle } from './utils/theme';
import {
  INITIAL_PROFILE,
  INITIAL_BUDGETS,
  INITIAL_SAVINGS_GOALS,
  INITIAL_INCOMES,
  INITIAL_EXPENSES,
  INITIAL_ALERTS
} from './utils/mockData';

// Modular Components
import AuthSim from './components/AuthSim';
import UserProfile from './components/UserProfile';
import SmartAdvisor from './components/SmartAdvisor';
import TransactionsList from './components/TransactionsList';
import CategoryBudgets from './components/CategoryBudgets';
import SavingsGoals from './components/SavingsGoals';
import Analytics from './components/Analytics';

// Navigation & Design Icons
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Percent,
  TrendingUp,
  Receipt,
  Goal,
  BarChart3,
  Brain,
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  PiggyBank,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Info
} from 'lucide-react';

export default function App() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionUser, setSessionUser] = useState<ProfileType | null>(null);

  // Core Ledgers
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [profile, setProfile] = useState<ProfileType>(INITIAL_PROFILE);
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);

  // Navigation states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'budgets' | 'goals' | 'analytics' | 'insights' | 'settings'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState<boolean>(false);

  // Check auth details at initial load
  useEffect(() => {
    const token = localStorage.getItem('auth_security_token');
    if (token) {
      setIsAuthenticated(true);
      
      // Load user specifics from local database
      const storedExpenses = localStorage.getItem('fin_expenses');
      const storedIncome = localStorage.getItem('fin_income');
      const storedBudgets = localStorage.getItem('fin_budgets');
      const storedGoals = localStorage.getItem('fin_goals');
      const storedProfile = localStorage.getItem('fin_profile');
      const storedAlerts = localStorage.getItem('fin_alerts');

      setExpenses(storedExpenses ? JSON.parse(storedExpenses) : INITIAL_EXPENSES);
      setIncome(storedIncome ? JSON.parse(storedIncome) : INITIAL_INCOMES);
      setBudgets(storedBudgets ? JSON.parse(storedBudgets) : INITIAL_BUDGETS);
      setGoals(storedGoals ? JSON.parse(storedGoals) : INITIAL_SAVINGS_GOALS);
      setProfile(storedProfile ? JSON.parse(storedProfile) : INITIAL_PROFILE);
      setAlerts(storedAlerts ? JSON.parse(storedAlerts) : INITIAL_ALERTS);
    }
  }, [isAuthenticated]);

  // Sync state mutations to local database
  const saveStateToLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleLoginSuccess = (user: Partial<ProfileType>) => {
    setIsAuthenticated(true);
    const updatedProfile = { ...INITIAL_PROFILE, ...user } as ProfileType;
    setProfile(updatedProfile);
    saveStateToLocal('fin_profile', updatedProfile);
  };

  const handleLogOut = () => {
    localStorage.removeItem('auth_security_token');
    setIsAuthenticated(false);
  };

  // State Updates Handled Real-Time
  const handleUpdateProfile = (updates: Partial<ProfileType>) => {
    const nextProfile = { ...profile, ...updates };
    setProfile(nextProfile);
    saveStateToLocal('fin_profile', nextProfile);
  };

  const handleAddExpense = (newExp: Omit<Expense, 'id'>) => {
    const exp: Expense = {
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...newExp
    };
    const nextExpenses = [exp, ...expenses];
    setExpenses(nextExpenses);
    saveStateToLocal('fin_expenses', nextExpenses);
    
    // Add success toast alert automatically
    triggerAutomaticAlert('success', 'Expense log added', `${newExp.title} ($${newExp.amount}) tracked successfully.`);
  };

  const handleEditExpense = (id: string, updatedExp: Omit<Expense, 'id'>) => {
    const nextExpenses = expenses.map(e => e.id === id ? { ...e, ...updatedExp } : e);
    setExpenses(nextExpenses);
    saveStateToLocal('fin_expenses', nextExpenses);
  };

  const handleDeleteExpense = (id: string) => {
    const nextExpenses = expenses.filter(e => e.id !== id);
    setExpenses(nextExpenses);
    saveStateToLocal('fin_expenses', nextExpenses);
  };

  const handleAddIncome = (newInc: Omit<Income, 'id'>) => {
    const inc: Income = {
      id: `inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...newInc
    };
    const nextIncome = [inc, ...income];
    setIncome(nextIncome);
    saveStateToLocal('fin_income', nextIncome);

    triggerAutomaticAlert('success', 'Income flow tracked', `${newInc.source} ($${newInc.amount}) credited successfully.`);
  };

  const handleEditIncome = (id: string, updatedInc: Omit<Income, 'id'>) => {
    const nextIncome = income.map(i => i.id === id ? { ...i, ...updatedInc } : i);
    setIncome(nextIncome);
    saveStateToLocal('fin_income', nextIncome);
  };

  const handleDeleteIncome = (id: string) => {
    const nextIncome = income.filter(i => i.id !== id);
    setIncome(nextIncome);
    saveStateToLocal('fin_income', nextIncome);
  };

  const handleSetBudget = (category: any, limit: number) => {
    const existingIdx = budgets.findIndex(b => b.category === category);
    let nextBudgets = [...budgets];
    if (existingIdx > -1) {
      nextBudgets[existingIdx].limit = limit;
    } else {
      nextBudgets.push({ category, limit });
    }
    setBudgets(nextBudgets);
    saveStateToLocal('fin_budgets', nextBudgets);

    triggerAutomaticAlert('info', 'Budget limits adjusted', `${category} category threshold configured to $${limit}.`);
  };

  const handleDeleteBudget = (category: any) => {
    const nextBudgets = budgets.filter(b => b.category !== category);
    setBudgets(nextBudgets);
    saveStateToLocal('fin_budgets', nextBudgets);
  };

  const handleAddGoal = (newGoal: Omit<SavingsGoal, 'id'>) => {
    const goal: SavingsGoal = {
      id: `goal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...newGoal
    };
    const nextGoals = [...goals, goal];
    setGoals(nextGoals);
    saveStateToLocal('fin_goals', nextGoals);

    triggerAutomaticAlert('success', 'Capital goal designed', `Target of $${newGoal.target_amount} defined for ${newGoal.goal_name}.`);
  };

  const handleUpdateGoalProgress = (id: string, amount: number) => {
    const nextGoals = goals.map(g => g.id === id ? { ...g, current_amount: amount } : g);
    setGoals(nextGoals);
    saveStateToLocal('fin_goals', nextGoals);
    
    // Select the current goal
    const targetGoal = goals.find(g => g.id === id);
    if (targetGoal && amount >= targetGoal.target_amount) {
      triggerAutomaticAlert('success', 'Goal Landmark Unlocked!', `Splendid work! You achieved 100% savings for ${targetGoal.goal_name}.`);
    }
  };

  const handleDeleteGoal = (id: string) => {
    const nextGoals = goals.filter(g => g.id !== id);
    setGoals(nextGoals);
    saveStateToLocal('fin_goals', nextGoals);
  };

  const handleImportTransactions = (importedExps: Omit<Expense, 'id'>[], importedIncs: Omit<Income, 'id'>[]) => {
    const fullExps: Expense[] = importedExps.map(e => ({
      id: `exp-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      ...e
    }));
    const fullIncs: Income[] = importedIncs.map(i => ({
      id: `inc-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      ...i
    }));

    const nextExpenses = [...fullExps, ...expenses];
    const nextIncome = [...fullIncs, ...income];

    setExpenses(nextExpenses);
    setIncome(nextIncome);

    saveStateToLocal('fin_expenses', nextExpenses);
    saveStateToLocal('fin_income', nextIncome);
  };

  const handleClearData = () => {
    localStorage.clear();
    setExpenses([]);
    setIncome([]);
    setBudgets([]);
    setGoals([]);
    setProfile(INITIAL_PROFILE);
    setAlerts([]);
    setActiveTab('dashboard');
  };

  const triggerAutomaticAlert = (type: 'info' | 'warning' | 'success', title: string, message: string) => {
    const newAlert: SmartAlert = {
      id: `alert-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    const nextAlerts = [newAlert, ...alerts];
    setAlerts(nextAlerts);
    saveStateToLocal('fin_alerts', nextAlerts);
  };

  const handleMarkAllAlertsRead = () => {
    const nextAlerts = alerts.map(a => ({ ...a, read: true }));
    setAlerts(nextAlerts);
    saveStateToLocal('fin_alerts', nextAlerts);
  };

  // 4. Calculations for KPI Statistics (June 2026 Focus prefix '2026-06')
  const getCurrentMonthSumExpense = () => {
    return expenses
      .filter(e => e.date.startsWith('2026-06'))
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const getCurrentMonthSumIncome = () => {
    return income
      .filter(i => i.date.startsWith('2026-06'))
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const getLifetimeExpenses = () => {
    return expenses.reduce((sum, item) => sum + item.amount, 0);
  };

  const getLifetimeIncomes = () => {
    return income.reduce((sum, item) => sum + item.amount, 0);
  };

  // Net Balance and dynamic savings margins
  const netLifetimeInward = getLifetimeIncomes();
  const netLifetimeOutward = getLifetimeExpenses();
  const lifetimeBalance = netLifetimeInward - netLifetimeOutward;

  const currentMonthExpenses = getCurrentMonthSumExpense();
  const currentMonthInflow = getCurrentMonthSumIncome();
  const currentMonthSavings = currentMonthInflow - currentMonthExpenses;

  const currencySymbol = CURRENCIES[profile.currency]?.symbol || '₹';
  const t = (key: string) => getTranslation(key, profile.language || 'en');
  const activeTheme = getTheme(profile);
  const cardStyle = getCardStyle(profile.theme);

  // Protect view access on client-side
  if (!isAuthenticated) {
    return <AuthSim onLoginSuccess={handleLoginSuccess} initialProfile={INITIAL_PROFILE} />;
  }

  return (
    <div className={`min-h-screen ${profile.theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-[#FAF8F5] text-slate-800'} transition-colors duration-300 flex font-sans relative overflow-hidden`}>
      {/* Luxurious ambient backlighting orbs */}
      <div className={`absolute top-0 right-0 w-[450px] h-[450px] ${activeTheme.color === 'indigo' ? 'bg-indigo-500/5' : activeTheme.color === 'emerald' ? 'bg-emerald-500/5' : 'bg-amber-500/5'} rounded-full blur-[140px] pointer-events-none z-0`} />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-rose-500/3 rounded-full blur-[100px] pointer-events-none z-0" />
      
      {/* Visual Backdrop Overlay for Mobile Sidebars */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 z-35 bg-slate-900/10 backdrop-blur-xs" 
        />
      )}      {/* Left Sidebar Frame */}
      <aside className={`fixed lg:sticky top-0 left-0 bottom-0 z-40 w-72 bg-slate-900 text-white p-6 border-r border-slate-800 flex flex-col justify-between transform transition-transform duration-300 shrink-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${activeTheme.primaryBg} rounded-xl flex items-center justify-center shadow-lg shrink-0`}>
                <Wallet className="w-5 h-5 text-indigo-100" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-wide">{t('appTitle')}</h1>
                <span className="block text-[10px] opacity-70 font-bold uppercase tracking-widest mt-0.5">{t('appSubtitle')}</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Navigation link stacks */}
          <nav className="space-y-1">
            <button
              onClick={() => { setActiveTab('dashboard'); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'dashboard' ? `${activeTheme.primaryBg} text-white shadow-md` : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/55'
              }`}
            >
              <Wallet className="w-4.5 h-4.5" />
              <span>{t('financesCanvas')}</span>
            </button>

            <button
              onClick={() => { setActiveTab('transactions'); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'transactions' ? `${activeTheme.primaryBg} text-white shadow-md` : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/55'
              }`}
            >
              <Receipt className="w-4.5 h-4.5" />
              <span>{t('unifiedLedger')}</span>
            </button>

            <button
              onClick={() => { setActiveTab('budgets'); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'budgets' ? `${activeTheme.primaryBg} text-white shadow-md` : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/55'
              }`}
            >
              <Percent className="w-4.5 h-4.5" />
              <span>{t('monthlyBudgetCaps')}</span>
            </button>

            <button
              onClick={() => { setActiveTab('goals'); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'goals' ? `${activeTheme.primaryBg} text-white shadow-md` : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/55'
              }`}
            >
              <Goal className="w-4.5 h-4.5" />
              <span>{t('savingsTargets')}</span>
            </button>

            <button
              onClick={() => { setActiveTab('analytics'); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'analytics' ? `${activeTheme.primaryBg} text-white shadow-md` : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/55'
              }`}
            >
              <BarChart3 className="w-4.5 h-4.5" />
              <span>{t('analyticsReport')}</span>
            </button>

            <button
              onClick={() => { setActiveTab('insights'); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'insights' ? `${activeTheme.primaryBg} text-white` : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/55'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Brain className="w-4.5 h-4.5" />
                <span>{t('aiAdvisory')}</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 animate-pulse shrink-0" />
            </button>

            <button
              onClick={() => { setActiveTab('settings'); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'settings' ? `${activeTheme.primaryBg} text-white shadow-md` : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/55'
              }`}
            >
              <Settings className="w-4.5 h-4.5" />
              <span>{t('preferences')}</span>
            </button>
          </nav>
        </div>

        {/* User Card & Log out */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3.5 pr-2">
            <img
              src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
              alt={profile.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-800 shadow-inner shrink-0"
            />
            <div className="min-w-0">
              <span className="block text-xs font-extrabold text-white truncate leading-tight">{profile.name}</span>
              <span className="block text-[10px] opacity-75 truncate mt-0.5">{profile.email}</span>
            </div>
          </div>

          <button
            onClick={handleLogOut}
            className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-450 hover:bg-rose-950/20 transition-all border border-rose-900/10"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>{t('terminateSession')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Side Wrapper Layout */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        
        {/* Top Navigation bar */}
        <header className={`sticky top-0 z-30 px-6 py-4 border-b transition-colors ${cardStyle.bg} shrink-0 flex items-center justify-between shadow-xs print:hidden`}>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-gray-200/50 hover:bg-gray-50 transition-colors"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            <span className="font-extrabold text-sm tracking-tight capitalize select-none hidden sm:inline-block">
              {activeTab === 'dashboard' ? 'Financial Dashboard' : activeTab} Panel
            </span>
          </div>

          <div className="flex items-center gap-4 relative">
            {/* Preferred currency indicator */}
            <span className={`px-3 py-1 ${activeTheme.lightBg} border ${activeTheme.borderPrimary} ${activeTheme.lightText} text-[10px] font-bold rounded-lg uppercase hidden sm:inline-block`}>
              {t('currencyPref')}: {profile.currency} ({currencySymbol})
            </span>

            {/* Smart Alerts & Notification bell dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                className="p-2.5 rounded-xl border border-gray-250 hover:bg-gray-50/50 transition-colors relative"
                aria-label="Open notifications dropdown"
              >
                <Bell className="w-4.5 h-4.5 text-gray-500" />
                {alerts.filter(a => !a.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-bounce" />
                )}
              </button>

              {showAlertsDropdown && (
                <div className={`absolute right-0 mt-3 w-80 rounded-2xl border shadow-xl p-5 overflow-hidden z-50 ${cardStyle.bg} ${profile.theme === 'dark' ? 'text-white' : 'text-gray-850'} animate-fadeIn`}>
                  <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                    <span className="font-extrabold text-xs uppercase tracking-wider">{t('alertsLedger')}</span>
                    <button
                      onClick={handleMarkAllAlertsRead}
                      className={`text-[10px] ${activeTheme.primaryText} font-bold hover:underline`}
                    >
                      {t('markAllRead')}
                    </button>
                  </div>

                  <div className="mt-3.5 space-y-3.5 max-h-64 overflow-y-auto divide-y divide-gray-100/50">
                    {alerts.length === 0 ? (
                      <p className="py-4 text-xs text-center text-gray-400">{t('allQuiet')}</p>
                    ) : (
                      alerts.map((alert) => (
                        <div key={alert.id} className={`pt-3.5 pb-0.5 flex gap-3 ${alert.read ? 'opacity-65' : ''}`}>
                          {alert.type === 'success' ? (
                            <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                          ) : alert.type === 'warning' ? (
                            <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                          ) : (
                            <Info className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-1">
                            <span className="block font-bold text-xs">{alert.title}</span>
                            <p className="text-[10px] text-gray-400 leading-normal">{alert.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar Trigger leading directly to preferences */}
            <button
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-2.5 border-l border-gray-150 pl-4 text-left transition-transform active:scale-95 shrink-0"
            >
              <img
                src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
                alt={profile.name}
                className="w-8.5 h-8.5 rounded-full object-cover border border-gray-100"
              />
            </button>
          </div>
        </header>

        {/* Dynamic Nav Viewports */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          
          {/* Dashboard Panel Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fadeIn" id="dashboard-view">
                           {/* Core KPI metrics row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className={`${cardStyle.bg} p-5.5 space-y-3.5`}>
                  <div className="flex items-center justify-between">
                    <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{t('remainingReserve')}</span>
                    <span className={`p-2 ${activeTheme.lightBg} ${activeTheme.lightText} rounded-lg`}><Wallet className="w-4 h-4" /></span>
                  </div>
                  <div className="space-y-0.5">
                    <span className={`block text-2xl font-extrabold tracking-tighter ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {currencySymbol}{lifetimeBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="block text-[10px] text-gray-400 font-semibold">{t('totalInwardVsTracked')}</span>
                  </div>
                </div>

                <div className={`${cardStyle.bg} p-5.5 space-y-3.5`}>
                  <div className="flex items-center justify-between">
                    <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{t('monthInflowSum')}</span>
                    <span className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><ArrowUpRight className="w-4 h-4" /></span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-2xl font-extrabold text-emerald-500 tracking-tighter">
                      {currencySymbol}{currentMonthInflow.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="block text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                      LIMIT: {currencySymbol}{profile.monthlyIncomeSetting.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className={`${cardStyle.bg} p-5.5 space-y-3.5`}>
                  <div className="flex items-center justify-between">
                    <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{t('monthOutflowSum')}</span>
                    <span className="p-2 bg-rose-500/10 text-rose-500 rounded-lg"><ArrowDownRight className="w-4 h-4" /></span>
                  </div>
                  <div className="space-y-0.5">
                    <span className={`block text-2xl font-extrabold tracking-tighter ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {currencySymbol}{currentMonthExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="block text-[10px] text-gray-400 font-semibold">{t('trackedOutflowOps')}</span>
                  </div>
                </div>

                <div className={`${cardStyle.bg} p-5.5 space-y-3.5`}>
                  <div className="flex items-center justify-between">
                    <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{t('dispatchedSavings')}</span>
                    <span className="p-2 bg-amber-505/10 text-amber-500 rounded-lg"><PiggyBank className="w-4 h-4" /></span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="block text-2xl font-extrabold text-amber-500 tracking-tighter">
                      {currencySymbol}{currentMonthSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="block text-[10px] text-gray-400 font-semibold">{t('availableSurplus')}</span>
                  </div>
                </div>
              </div>

              {/* Grid block detailing Charts & Recent Entries */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent transaction ledgers */}
                <div className="lg:col-span-2 space-y-6">
                  <div className={`${cardStyle.bg} p-6 space-y-4`}>
                    <div className={`flex items-center justify-between pb-3 border-b ${cardStyle.divider}`}>
                      <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <Receipt className={`w-4 h-4 ${activeTheme.primaryText}`} />
                        {t('dispatchedLedger')}
                      </h3>
                      <button
                        onClick={() => setActiveTab('transactions')}
                        className={`text-[10px] ${activeTheme.primaryText} font-bold hover:underline tracking-wider uppercase`}
                      >
                        {t('ledgerDetails')} &rarr;
                      </button>
                    </div>

                    <div className="divide-y divide-gray-55/80 max-h-96 overflow-y-auto pr-1">
                      {expenses.length === 0 && income.length === 0 ? (
                        <p className="py-12 text-xs text-center text-gray-400">{t('noTransactions')}</p>
                      ) : (
                        [...expenses.map(e => ({ ...e, type: 'expense' as const })), ...income.map(i => ({ id: i.id, title: i.source, amount: i.amount, category: 'Other' as any, date: i.date, type: 'income' as const }))]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .slice(0, 5)
                          .map((t) => (
                             <div key={`${t.type}-${t.id}`} className={`py-3.5 flex items-center justify-between gap-4 border-b last:border-b-0 ${cardStyle.divider}`}>
                               <div className="min-w-0 space-y-1">
                                 <p className={`font-bold text-xs truncate leading-none ${profile.theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>{t.title}</p>
                                 <span className="block text-[10px] text-gray-400 font-medium">Date: {t.date}</span>
                               </div>
                               <span className={`font-mono font-bold text-xs ${t.type === 'expense' ? (profile.theme === 'dark' ? 'text-rose-400' : 'text-gray-900') : 'text-emerald-500'}`}>
                                 {t.type === 'expense' ? '-' : '+'}{currencySymbol}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 1 })}
                               </span>
                             </div>
                          ))
                      )}
                    </div>
                  </div>

                  {/* Highlights section */}
                  <div className={`p-6 ${activeTheme.lightBg} rounded-2xl border ${activeTheme.borderPrimary} flex flex-col sm:flex-row items-center justify-between gap-6`}>
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="font-bold text-gray-950 text-sm flex items-center justify-center sm:justify-start gap-1.5">
                        <Brain className={`w-4 h-4 ${activeTheme.primaryText} animate-pulse`} />
                        {t('aiAdvisorActive')}
                      </h4>
                      <p className="text-xs text-gray-500 max-w-md leading-relaxed">
                        {t('aiAdvisorDesc')}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('insights')}
                      className={`px-4.5 py-2.5 ${activeTheme.primaryBg} ${activeTheme.primaryHoverBg} text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 text-center shrink-0 w-full sm:w-auto transition-colors`}
                    >
                      <span>{t('analyzeFinance')} &rarr;</span>
                    </button>
                  </div>
                </div>

                {/* Savings progress widgets */}
                <div className="lg:col-span-1 space-y-6">
                  <div className={`${cardStyle.bg} p-6 space-y-5`}>
                    <div className={`flex items-center justify-between pb-3 border-b ${cardStyle.divider}`}>
                      <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        <Goal className={`w-4 h-4 ${activeTheme.primaryText}`} />
                        {t('savingsTargetCards')}
                      </h3>
                      <button
                        onClick={() => setActiveTab('goals')}
                        className={`text-[10px] ${activeTheme.primaryText} font-bold hover:underline uppercase tracking-wider`}
                      >
                        Goals &rarr;
                      </button>
                    </div>

                    <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                      {goals.length === 0 ? (
                        <p className="py-8 text-xs text-center text-gray-400">{t('noActiveSavings')}</p>
                      ) : (
                        goals.slice(0, 3).map((goal) => {
                           const ratio = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                           return (
                             <div key={goal.id} className="space-y-1.5">
                               <div className="flex items-center justify-between text-xs">
                                 <span className={`font-bold truncate pr-4 ${profile.theme === 'dark' ? 'text-slate-100' : 'text-gray-800'}`}>{goal.goal_name}</span>
                                 <span className={`font-bold ${activeTheme.primaryText}`}>{ratio.toFixed(0)}%</span>
                               </div>
                               <div className={`w-full ${profile.theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'} h-1.5 rounded-full overflow-hidden`}>
                                 <div
                                   className={`h-full ${activeTheme.primaryBg} rounded-full transition-all`}
                                   style={{ width: `${Math.min(100, ratio)}%` }}
                                 />
                               </div>
                               <span className="block text-[10px] text-gray-400 text-right">
                                 {currencySymbol}{goal.current_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })} / {currencySymbol}{goal.target_amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                               </span>
                             </div>
                           );
                        })
                      )}
                    </div>
                  </div>

                  {/* Financial health helper card */}
                  <div className={`${cardStyle.bg} p-5 space-y-2.5`}>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                      <Percent className={`w-4.5 h-4.5 ${activeTheme.primaryText}`} />
                      {t('savingsRatioPacing')}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                      {t('savingsRatioDesc')} <span className={`font-extrabold ${activeTheme.primaryText} font-mono`}>
                        {currentMonthInflow > 0 ? Math.round((currentMonthSavings / currentMonthInflow) * 100) : 0}%
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Unified Ledger Router */}
          {activeTab === 'transactions' && (
            <TransactionsList
              expenses={expenses}
              income={income}
              profile={profile}
              onAddExpense={handleAddExpense}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
              onAddIncome={handleAddIncome}
              onEditIncome={handleEditIncome}
              onDeleteIncome={handleDeleteIncome}
            />
          )}

          {/* Monthly Budget Caps Router */}
          {activeTab === 'budgets' && (
            <CategoryBudgets
              budgets={budgets}
              expenses={expenses}
              profile={profile}
              onSetBudget={handleSetBudget}
              onDeleteBudget={handleDeleteBudget}
            />
          )}

          {/* Savings Targets Router */}
          {activeTab === 'goals' && (
            <SavingsGoals
              goals={goals}
              profile={profile}
              onAddGoal={handleAddGoal}
              onUpdateGoalProgress={handleUpdateGoalProgress}
              onDeleteGoal={handleDeleteGoal}
            />
          )}

          {/* Analytics Details Router */}
          {activeTab === 'analytics' && (
            <Analytics
              expenses={expenses}
              income={income}
              budgets={budgets}
              profile={profile}
              onImportTransactions={handleImportTransactions}
            />
          )}

          {/* AI Wealth Advisor Router */}
          {activeTab === 'insights' && (
            <SmartAdvisor
              expenses={expenses}
              income={income}
              budgets={budgets}
              goals={goals}
              profile={profile}
            />
          )}

          {/* Preferences Settings Router */}
          {activeTab === 'settings' && (
            <UserProfile
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onClearData={handleClearData}
            />
          )}

        </main>

        {/* Outer subtle branding credit line completely isolated footer layout */}
        <footer className="px-6 py-4 border-t border-gray-100/50 text-center text-[10px] text-gray-400 font-medium select-none print:hidden uppercase tracking-widest shrink-0">
          {t('securedViaLocal')}
        </footer>
      </div>
    </div>
  );
}
