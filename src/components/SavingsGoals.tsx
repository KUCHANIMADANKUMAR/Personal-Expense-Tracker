import React, { useState } from 'react';
import { SavingsGoal, UserProfile, CURRENCIES } from '../types';
import { Award, CalendarCheck, TrendingUp, Plus, Trash2, ShieldCheck, ChevronRight, Check, X, Building } from 'lucide-react';
import { getTheme, getCardStyle } from '../utils/theme';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  profile: UserProfile;
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateGoalProgress: (id: string, amount: number) => void;
  onDeleteGoal: (id: string) => void;
}

export default function SavingsGoals({
  goals,
  profile,
  onAddGoal,
  onUpdateGoalProgress,
  onDeleteGoal
}: SavingsGoalsProps) {
  // Adding goal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // 6 months default

  // Transferring state (Add investment helper)
  const [activeActionGoal, setActiveActionGoal] = useState<SavingsGoal | null>(null);
  const [actionType, setActionType] = useState<'add' | 'withdraw'>('add');
  const [actionAmount, setActionAmount] = useState('');

  const currencySymbol = CURRENCIES[profile.currency]?.symbol || '₹';
  const activeTheme = getTheme(profile);
  const styles = getCardStyle(profile.theme);

  const handleSubmitGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(targetAmount);
    const currentVal = parseFloat(currentAmount || '0');

    if (isNaN(targetVal) || targetVal <= 0) {
      alert('Provide a target amount.');
      return;
    }

    onAddGoal({
      goal_name: goalName,
      target_amount: targetVal,
      current_amount: currentVal,
      deadline
    });

    setGoalName('');
    setTargetAmount('');
    setCurrentAmount('');
    setDeadline(new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setShowAddModal(false);
  };

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(actionAmount);
    if (isNaN(val) || val <= 0 || !activeActionGoal) {
      alert('Please state a valid amount.');
      return;
    }

    const modifier = actionType === 'add' ? val : -val;
    const newCurrent = Math.max(0, activeActionGoal.current_amount + modifier);

    onUpdateGoalProgress(activeActionGoal.id, newCurrent);
    setActiveActionGoal(null);
    setActionAmount('');
  };

  const calculateDaysRemaining = (end: string) => {
    const diff = new Date(end).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const totalCollectedSavings = goals.reduce((sum, item) => sum + item.current_amount, 0);
  const totalTargetNeeded = goals.reduce((sum, item) => sum + item.target_amount, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="savings-tracker">
      {/* Saving KPI row */}
      <div className={`flex flex-col md:flex-row items-center justify-between gap-4 ${styles.bg} p-6`}>
        <div className="space-y-1">
          <h2 className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <Building className={`w-5 h-5 ${activeTheme.primaryText}`} />
            Strategic Savings Tracker & Goals
          </h2>
          <p className="text-xs text-gray-400 font-medium">
            Current aggregate savings deposits: <span className={`font-bold ${profile.theme === 'dark' ? 'text-emerald-400' : 'text-gray-700'}`}>{currencySymbol}{totalCollectedSavings.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span> out of <span className="font-semibold text-gray-500">{currencySymbol}{totalTargetNeeded.toLocaleString(undefined, { minimumFractionDigits: 0 })}</span> targets.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className={`w-full md:w-auto px-4.5 py-2.5 ${activeTheme.primaryBg} ${activeTheme.primaryHoverBg} text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2`}
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {goals.length === 0 ? (
        <div className={`p-12 text-center text-gray-400 rounded-2xl border ${profile.theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-gray-100'} shadow-xs`}>
          <Award className="w-9 h-9 mx-auto stroke-1 text-indigo-400" />
          <p className="font-semibold text-sm text-slate-300 mt-2">No active savings targets set.</p>
          <p className="text-xs mt-1">Deploy capital limits or configure an Emergency Fund card above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const ratio = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
            const daysLeft = calculateDaysRemaining(goal.deadline);
            const isCompleted = ratio >= 100;

            return (
              <div
                key={goal.id}
                className={`${styles.bg} p-6 transition-shadow relative overflow-hidden flex flex-col justify-between`}
              >
                {/* Complete shine effect overlay */}
                {isCompleted && (
                  <div className={`absolute top-0 right-0 ${profile.theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-55 text-emerald-700 border-emerald-100'} px-3 py-1 font-bold text-[10px] uppercase tracking-wider rounded-bl-xl border-l border-b flex items-center gap-1`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Complete
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1 pr-14">
                    <h3 className={`font-bold transition-colors text-base ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{goal.goal_name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <CalendarCheck className="w-3.5 h-3.5" />
                        Target: {goal.deadline}
                      </span>
                      <span>•</span>
                      <span className="font-semibold">{daysLeft} days remaining</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-end justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="text-gray-400 block">Funds accumulated</span>
                        <span className={`font-mono font-extrabold text-sm ${profile.theme === 'dark' ? 'text-emerald-400' : 'text-gray-800'}`}>
                          {currencySymbol}{goal.current_amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                      
                      <div className="text-right space-y-0.5">
                        <span className="text-gray-400 block">Goal target</span>
                        <span className={`font-mono font-semibold text-xs ${profile.theme === 'dark' ? 'text-slate-300' : 'text-gray-500'}`}>
                          {currencySymbol}{goal.target_amount.toLocaleString(undefined, { minimumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>

                    {/* Progress Slider track block */}
                    <div className={`relative w-full h-2.5 ${profile.theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'} rounded-full overflow-hidden`}>
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-indigo-550 to-indigo-400'
                        }`}
                        style={{ width: `${Math.min(100, ratio)}%` }}
                      />
                    </div>

                    <span className={`block font-bold text-xs text-right mt-1 ${isCompleted ? 'text-emerald-555' : activeTheme.primaryText}`}>
                      {ratio.toFixed(0)}% Saved
                    </span>
                  </div>
                </div>

                {/* Goals funding adjustment buttons */}
                <div className={`mt-6 pt-5 border-t ${styles.divider} flex items-center justify-between gap-3 gap-y-2 flex-wrap`}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveActionGoal(goal);
                        setActionType('add');
                        setActionAmount('');
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${profile.theme === 'dark' ? 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800' : 'bg-slate-50 hover:bg-slate-100 text-gray-700 border-slate-200'}`}
                    >
                      + Deposit Funds
                    </button>
                    <button
                      onClick={() => {
                        setActiveActionGoal(goal);
                        setActionType('withdraw');
                        setActionAmount('');
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${profile.theme === 'dark' ? 'bg-slate-900/50 hover:bg-slate-800/80 text-slate-400 border-slate-800' : 'bg-white hover:bg-slate-50/50 text-gray-600 border-slate-200'}`}
                    >
                      - Withdraw
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Remove savings goal target "${goal.goal_name}"?`)) {
                        onDeleteGoal(goal.id);
                      }
                    }}
                    className={`p-1 px-1.5 rounded-lg text-gray-400 ${profile.theme === 'dark' ? 'hover:bg-rose-500/10 hover:text-rose-400' : 'hover:bg-rose-55 hover:text-rose-600'} transition-colors`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className={`${profile.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-2xl max-w-sm w-full shadow-2xl border overflow-hidden`}>
            <div className={`px-5 py-4 ${profile.theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-gray-100'} border-b flex items-center justify-between`}>
              <h3 className={`font-bold text-sm uppercase tracking-wider ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Configure New Savings Target</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitGoal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Goal Description Name</label>
                <input
                  type="text"
                  required
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold ${styles.input}`}
                  placeholder="e.g. Emergency Fund, Tesla Downpayment..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Target Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-semibold ${styles.input}`}
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Initial Deposit</label>
                  <input
                    type="number"
                    min="0"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-semibold ${styles.input}`}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Goal Deadline</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold ${styles.input}`}
                />
              </div>

              <div className={`pt-4 border-t ${styles.divider} flex items-center justify-end gap-3.5`}>
                <button type="button" onClick={() => setShowAddModal(false)} className={`px-4 py-2 text-xs font-semibold ${profile.theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>Cancel</button>
                <button type="submit" className={`px-5 py-2.5 ${activeTheme.primaryBg} ${activeTheme.primaryHoverBg} text-white rounded-xl text-xs font-bold uppercase tracking-wider`}>Deploy Target</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Capital Addition/Withdrawal form */}
      {activeActionGoal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className={`${profile.theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} rounded-2xl max-w-xs w-full shadow-2xl border overflow-hidden`}>
            <div className={`px-5 py-4 ${profile.theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-gray-100'} border-b flex items-center justify-between`}>
              <h3 className={`font-bold text-xs uppercase tracking-wider ${profile.theme === 'dark' ? 'text-white' : 'text-gray-950'}`}>
                {actionType === 'add' ? 'Deposit to' : 'Withdraw from'} {activeActionGoal.goal_name}
              </h3>
              <button onClick={() => setActiveActionGoal(null)} className="p-1 rounded-md text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleActionSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Capital Amount ({currencySymbol})</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  autoFocus
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-semibold ${styles.input}`}
                  placeholder="0.00"
                />
              </div>

              <div className={`pt-4 border-t ${styles.divider} flex items-center justify-end gap-3`}>
                <button type="button" onClick={() => setActiveActionGoal(null)} className={`px-4 py-2 text-xs font-semibold ${profile.theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-gray-500'}`}>Cancel</button>
                <button type="submit" className={`px-5 py-2 ${activeTheme.primaryBg} ${activeTheme.primaryHoverBg} text-white rounded-xl text-xs font-bold uppercase tracking-wider`}>Complete Action</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
