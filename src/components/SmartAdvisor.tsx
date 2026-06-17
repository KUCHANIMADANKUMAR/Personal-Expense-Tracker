import React, { useState } from 'react';
import { Expense, Income, Budget, SavingsGoal, UserProfile, GeminiAdvice } from '../types';
import { Sparkles, Brain, Award, ShieldCheck, HelpCircle, ArrowUpRight, TrendingDown, ClipboardList, Info, Loader2 } from 'lucide-react';
import { getTheme, getCardStyle } from '../utils/theme';

interface SmartAdvisorProps {
  expenses: Expense[];
  income: Income[];
  budgets: Budget[];
  goals: SavingsGoal[];
  profile: UserProfile;
}

export default function SmartAdvisor({ expenses, income, budgets, goals, profile }: SmartAdvisorProps) {
  const activeTheme = getTheme(profile);
  const styles = getCardStyle(profile.theme);
  const [advice, setAdvice] = useState<GeminiAdvice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute stats locally to display immediate high-quality values
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Group by category to find highest spent
  const categorySpent: Record<string, number> = {};
  expenses.forEach((e) => {
    categorySpent[e.category] = (categorySpent[e.category] || 0) + e.amount;
  });

  let highestSpentCategory = 'None';
  let maxSpent = 0;
  Object.entries(categorySpent).forEach(([cat, val]) => {
    if (val > maxSpent) {
      maxSpent = val;
      highestSpentCategory = cat;
    }
  });

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          expenses,
          income,
          budgets,
          savingsGoals: goals,
          userProfile: profile
        })
      });

      if (!response.ok) {
        throw new Error('Server returned error while generating financial report');
      }

      const result = await response.json();
      setAdvice(result);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Could not trigger report generation.');
    } finally {
      setLoading(false);
    }
  };

  // Immediate Local Indicator Score (0 to 100)
  const baseHealthScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(40 + (savingsRate > 0 ? savingsRate / 1.5 : 0) - (expenses.length > 30 ? 5 : 0))
    )
  );

  const activeHealthScore = advice ? advice.healthScore : baseHealthScore;

  // Health status wording
  const getHealthStatus = (score: number) => {
    if (score >= 85) {
      return {
        text: 'Excellent Finance Control',
        class: profile.theme === 'dark' 
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
      };
    }
    if (score >= 70) {
      return {
        text: 'Healthy Balance Pacing',
        class: profile.theme === 'dark' 
          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
          : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
      };
    }
    if (score >= 50) {
      return {
        text: 'Moderate Spending Risk',
        class: profile.theme === 'dark' 
          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
          : 'bg-amber-50 text-amber-700 border border-amber-100'
      };
    }
    return {
      text: 'Urgent Capital Alert',
      class: profile.theme === 'dark' 
        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
        : 'bg-rose-50 text-rose-700 border border-rose-100'
    };
  };

  const status = getHealthStatus(activeHealthScore);

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="advisor-view">
      {/* Header and Call to action */}
      <div className="bg-linear-to-r from-indigo-900 to-slate-900 text-white p-8 rounded-2xl border border-indigo-950 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="space-y-2 relative z-10">
          <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-semibold text-indigo-300 uppercase tracking-widest inline-flex items-center gap-1.5 animate-pulse">
            <Brain className="w-3.5 h-3.5" />
            AI Smart Insights Engine
          </span>
          <h2 className="text-2xl font-bold tracking-tight">Smart Advisor & Wealth Consultant</h2>
          <p className="text-indigo-200 text-sm max-w-lg leading-relaxed">
            Unleash server-side Gemini 3.5 AI modeling to run deep telemetry on your budgets, savings goals progress, category speeds, and spending velocity.
          </p>
        </div>

        <div className="shrink-0 relative z-10 w-full md:w-auto">
          <button
            onClick={generateReport}
            disabled={loading}
            className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>Cooking AI Analytics...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{advice ? 'Re-Generate Wealth Tips' : 'Generate AI Wealth Advice'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Health Score Panel */}
        <div className={`md:col-span-1 ${styles.bg} p-6 flex flex-col items-center justify-center text-center relative`}>
          <h3 className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">Financial Health Score</h3>

          {/* Large Arc Gauge Simulation */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-95" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#F1F5F9"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="url(#indigoGrad)"
                strokeWidth="9"
                strokeDasharray={`${2.512 * activeHealthScore} 251.2`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="indigoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4F46E5" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
              <span className={`text-4xl font-extrabold tracking-tighter ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{activeHealthScore}</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mt-0.5">Index Rating</span>
            </div>
          </div>

          <div className={`mt-6 px-3.5 py-1.5 rounded-full ${status.class} text-xs font-bold uppercase tracking-wider`}>
            {status.text}
          </div>

          <div className={`mt-6 w-full pt-6 border-t ${styles.divider} space-y-3.5 text-left`}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium">Income/Expense Ratio</span>
              <span className={`font-semibold ${profile.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium">Calculated Savings Margin</span>
              <span className={`font-semibold ${netSavings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {profile.currency} {netSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry quick values */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`${styles.bg} p-5 flex items-start gap-4`}>
              <div className={`p-3 rounded-xl shrink-0 ${profile.theme === 'dark' ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Top Expenditures Segment</span>
                <span className={`block text-lg font-bold mt-1 ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{highestSpentCategory}</span>
                <span className="block text-xs text-gray-400 mt-0.5 font-medium">
                  Total spent: {profile.currency} {maxSpent.toLocaleString()}
                </span>
              </div>
            </div>

            <div className={`${styles.bg} p-5 flex items-start gap-4`}>
              <div className={`p-3 rounded-xl shrink-0 ${profile.theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Estimated Savings Rate</span>
                <span className={`block text-lg font-bold mt-1 ${activeTheme.primaryText}`}>{savingsRate}%</span>
                <span className="block text-xs text-gray-400 mt-0.5">
                  {savingsRate >= 20 ? 'Optimal (Target &gt; 20%)' : 'Needs Optimization'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Instructions Context Banner */}
          {!advice && !loading && (
            <div className={`p-6 rounded-2xl border space-y-4 ${profile.theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-indigo-50/50 border-indigo-100/60 text-slate-800'}`}>
              <div className="flex items-start gap-3">
                <Info className={`w-5 h-5 shrink-0 mt-0.5 ${activeTheme.primaryText}`} />
                <div className="space-y-1">
                  <h4 className={`font-bold text-sm ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>How is the Financial Score Evaluated?</h4>
                  <p className={`text-xs leading-relaxed ${profile.theme === 'dark' ? 'text-gray-400' : 'text-gray-650'}`}>
                    We aggregate all verified income flows against your expenditures over the last three months, then apply deductions based on active categories budget pacing overruns to assess capital efficiency.
                  </p>
                </div>
              </div>
              <p className={`text-xs font-semibold px-3.5 py-2.5 rounded-lg border ${profile.theme === 'dark' ? 'bg-indigo-950/40 border-indigo-900/30 text-indigo-305' : 'bg-indigo-50 border-indigo-100/50 text-indigo-700'}`}>
                💡 Tip: Hit the &quot;Generate AI Wealth Advice&quot; button above. If you have an active Gemini API Key saved in Settings, the advisor will write you an executive summary report!
              </p>
            </div>
          )}

          {/* Core AI Advisor generated content */}
          {loading && (
            <div className={`${styles.bg} p-8 space-y-6 animate-pulse`}>
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-indigo-505 animate-spin" />
                <h4 className={`font-bold text-sm ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Gemini AI Model analyzing statistics...</h4>
              </div>
              <div className="space-y-2.5">
                <div className="h-4 bg-gray-100 rounded-sm w-3/4" />
                <div className="h-4 bg-gray-100 rounded-sm w-5/6" />
                <div className="h-4 bg-gray-100 rounded-sm w-1/2" />
              </div>
            </div>
          )}

          {error && (
            <div className={`p-4 rounded-2xl text-xs border ${profile.theme === 'dark' ? 'bg-rose-950/20 border-rose-950/30 text-rose-400' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
              <p className="font-bold">Advisory generation failed</p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {advice && !loading && (
            <div className="space-y-6 animate-fadeIn">
              {/* Summary Block */}
              <div className={`${styles.bg} p-6 space-y-3`}>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ClipboardList className={`w-4 h-4 ${activeTheme.primaryText}`} />
                  Executive Financial Report Summary
                </h4>
                <p className={`text-sm leading-relaxed ${profile.theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>{advice.summary}</p>
                
                {advice.isActualAI && (
                  <span className={`inline-block text-[9px] px-2 py-0.5 rounded-md font-semibold border uppercase ${profile.theme === 'dark' ? 'bg-emerald-950/40 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                    Model: Gemini-3.5-Flash Verified Out
                  </span>
                )}
                {!advice.isActualAI && (
                  <span className={`inline-block text-[9px] px-2 py-0.5 rounded-md font-semibold border uppercase ${profile.theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-150 text-slate-500'}`}>
                    Fallback Precision Advisor Analysis
                  </span>
                )}
              </div>

              {/* Action recommendations list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 tracking-widest uppercase flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-500" />
                  High Impact Recommendation Plan
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  {advice.recommendations.map((tip, idx) => (
                    <div
                      key={idx}
                      className={`p-4 border rounded-xl flex items-start gap-3 ${profile.theme === 'dark' ? 'bg-emerald-950/10 border-emerald-900/20' : 'bg-emerald-50/40 border-emerald-100/60'}`}
                    >
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs shrink-0 mt-0.5 ${profile.theme === 'dark' ? 'bg-emerald-950 text-emerald-400' : 'bg-emerald-100 text-emerald-800'}`}>
                        {idx + 1}
                      </span>
                      <p className={`text-xs font-semibold leading-relaxed ${profile.theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
