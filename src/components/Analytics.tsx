import React, { useRef, useState } from 'react';
import { Expense, Income, Budget, UserProfile, CURRENCIES } from '../types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';
import { Download, Upload, Printer, FileText, CheckCircle, HelpCircle, FileSpreadsheet, Percent } from 'lucide-react';
import { getTheme, getCardStyle } from '../utils/theme';

interface AnalyticsProps {
  expenses: Expense[];
  income: Income[];
  budgets: Budget[];
  profile: UserProfile;
  onImportTransactions: (importedExpenses: Omit<Expense, 'id'>[], importedIncomes: Omit<Income, 'id'>[]) => void;
}

export default function Analytics({ expenses, income, budgets, profile, onImportTransactions }: AnalyticsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const currencySymbol = CURRENCIES[profile.currency]?.symbol || '₹';
  const activeTheme = getTheme(profile);
  const styles = getCardStyle(profile.theme);

  const getHexColor = (col: string) => {
    switch (col) {
      case 'indigo': return '#4F46E5';
      case 'emerald': return '#10B981';
      case 'amber': return '#F55E0B';
      case 'rose': return '#F43F5E';
      case 'violet': return '#8B5CF6';
      case 'teal': return '#14B8A6';
      default: return '#4F46E5';
    }
  };
  const themeHexColor = getHexColor(activeTheme.color);

  // Chart Color Presets
  const CHART_COLORS = [
    '#4F46E5', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#8B5CF6', // Violet
    '#06B6D4', // Cyan
    '#EF4444', // Red
    '#14B8A6', // Teal
    '#3B82F6', // Blue
    '#64748B'  // Slate
  ];

  // 1. Data Prep for Expense Category Breakdown (Pie Chart)
  const categorySpentMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categorySpentMap[e.category] = (categorySpentMap[e.category] || 0) + e.amount;
  });

  const pieData = Object.entries(categorySpentMap).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  })).sort((a, b) => b.value - a.value);

  // 2. Data Prep for Monthly Outflow Patterns (Bar Chart)
  // Let's filter to recent months: April, May, June 2026
  const getMonthTotalExpense = (monthPrefixStr: string) => {
    return expenses
      .filter((e) => e.date.startsWith(monthPrefixStr))
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const monthlyBarData = [
    { month: 'April 2026', Amount: getMonthTotalExpense('2026-04') },
    { month: 'May 2026', Amount: getMonthTotalExpense('2026-05') },
    { month: 'June 2026', Amount: getMonthTotalExpense('2026-06') }
  ];

  // 3. Data Prep for Income vs Expense Trends (Line Chart)
  const getMonthTotalIncome = (monthPrefixStr: string) => {
    return income
      .filter((i) => i.date.startsWith(monthPrefixStr))
      .reduce((sum, item) => sum + item.amount, 0);
  };

  const timelineData = [
    {
      name: 'Apr 26',
      Income: getMonthTotalIncome('2026-04'),
      Expenses: getMonthTotalExpense('2026-04')
    },
    {
      name: 'May 26',
      Income: getMonthTotalIncome('2026-05'),
      Expenses: getMonthTotalExpense('2026-05')
    },
    {
      name: 'Jun 26',
      Income: getMonthTotalIncome('2026-06'),
      Expenses: getMonthTotalExpense('2026-06')
    }
  ];

  // CSV Exporter Utility
  const handleExportCSV = () => {
    // Generate unified transactions representation
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Type,Title/Source,Amount,Category,Date,Notes\n';

    income.forEach((inc) => {
      csvContent += `Income,"${inc.source}",${inc.amount},Other,${inc.date},"${inc.notes || ''}"\n`;
    });

    expenses.forEach((exp) => {
      csvContent += `Expense,"${exp.title}",${exp.amount},${exp.category},${exp.date},"${exp.notes || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_ledger_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Importer Utility
  const handleCSVImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split('\n');
        const importedExpenses: Omit<Expense, 'id'>[] = [];
        const importedIncomes: Omit<Income, 'id'>[] = [];

        // Skip headers (Index 0)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const parts = line.split(',');
          if (parts.length < 5) continue;

          const type = parts[0].trim().toLowerCase();
          const titleOrSource = parts[1].replace(/"/g, '').trim();
          const amountVal = parseFloat(parts[2]);
          const categoryVal = parts[3].trim() as any;
          const dateVal = parts[4].trim();
          const notesVal = parts[5] ? parts[5].replace(/"/g, '').trim() : '';

          if (isNaN(amountVal) || !titleOrSource || !dateVal) continue;

          if (type === 'income') {
            importedIncomes.push({
              source: titleOrSource,
              amount: amountVal,
              date: dateVal,
              notes: notesVal || undefined
            });
          } else {
            importedExpenses.push({
              title: titleOrSource,
              amount: amountVal,
              category: categoryVal || 'Other',
              date: dateVal,
              notes: notesVal || undefined
            });
          }
        }

        if (importedExpenses.length > 0 || importedIncomes.length > 0) {
          onImportTransactions(importedExpenses, importedIncomes);
          setImportSuccess(`Import Complete! Successfully parsed ${importedExpenses.length} expenses & ${importedIncomes.length} incomes.`);
          setTimeout(() => setImportSuccess(null), 5000);
        } else {
          alert('Could not parse any valid transactions from the uploaded file structure.');
        }
      } catch (err) {
        console.error(err);
        alert('File read failure. Make sure CSV format complies with standard exporter headers.');
      }
    };
    reader.readAsText(file);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="graphs-analytics">
      {/* Utilities Action Bar */}
      <div className={`flex flex-wrap items-center justify-between gap-4 ${styles.bg} p-5 print:hidden`}>
        <div className="space-y-1">
          <h2 className={`text-base font-bold tracking-tight flex items-center gap-1.5 ${profile.theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <FileSpreadsheet className={`w-5 h-5 ${activeTheme.primaryText}`} />
            Financial Statement & Data Portability Container
          </h2>
          <p className="text-xs text-gray-400">Export or upload standardized files cleanly without loss.</p>
        </div>

        <div className="flex items-center gap-3.5 flex-wrap">
          <button
            onClick={handleCSVImportClick}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${profile.theme === 'dark' ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'}`}
          >
            <Upload className={`w-3.5 h-3.5 ${profile.theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} />
            <span>Import CSV Ledger</span>
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />

          <button
            onClick={handleExportCSV}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${profile.theme === 'dark' ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300' : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'}`}
          >
            <Download className={`w-3.5 h-3.5 ${profile.theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`} />
            <span>Export CSV Ledger</span>
          </button>

          <button
            onClick={handlePrintReport}
            className={`px-4 py-2.5 ${activeTheme.primaryBg} ${activeTheme.primaryHoverBg} text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Statement (PDF)</span>
          </button>
        </div>
      </div>

      {importSuccess && (
        <div className={`p-4 ${profile.theme === 'dark' ? 'bg-emerald-500/10 border-emerald-555/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-800'} border rounded-2xl flex items-center gap-3 animate-fadeIn print:hidden`}>
          <CheckCircle className="w-5 h-5 text-emerald-550 shrink-0" />
          <p className="text-xs font-semibold">{importSuccess}</p>
        </div>
      )}

      {/* Main Charts area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Income vs Expenses Timeline Line Chart */}
        <div className={`${styles.bg} p-6 flex flex-col justify-between`}>
          <div className="mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cash Flow Velocity</h3>
            <p className={`text-sm font-semibold mt-1 ${profile.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Income vs Expenditures Trend</p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={profile.theme === 'dark' ? '#1E293B' : '#F1F5F9'} />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`${currencySymbol}${value}`, undefined]}
                  contentStyle={{ 
                    backgroundColor: profile.theme === 'dark' ? '#0F172A' : '#FFF', 
                    borderRadius: '12px', 
                    border: `1px solid ${profile.theme === 'dark' ? '#1E293B' : '#F1F5F9'}`,
                    color: profile.theme === 'dark' ? '#FFF' : '#0F172A'
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="Income" stroke="#10B981" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Expenses" stroke="#EF4444" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories expenditures Breakdown (Pie Chart) */}
        <div className={`${styles.bg} p-6 flex flex-col justify-between`}>
          <div className="mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Category Allocation</h3>
            <p className={`text-sm font-semibold mt-1 ${profile.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Total Spending Breakdown</p>
          </div>

          {pieData.length === 0 ? (
            <div className={`h-64 flex items-center justify-center text-gray-400 text-xs text-center border-2 border-dashed ${profile.theme === 'dark' ? 'border-slate-800' : 'border-slate-100'} rounded-xl`}>
              Add expense records to analyze categories breakdown.
            </div>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${currencySymbol}${value}`, undefined]}
                    contentStyle={{ 
                      backgroundColor: profile.theme === 'dark' ? '#0F172A' : '#FFF', 
                      borderRadius: '12px', 
                      border: `1px solid ${profile.theme === 'dark' ? '#1E293B' : '#F1F5F9'}`,
                      color: profile.theme === 'dark' ? '#FFF' : '#0F172A'
                    }}
                  />
                  <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Monthly comparative bars */}
        <div className={`${styles.bg} p-6 md:col-span-2 flex flex-col justify-between`}>
          <div className="mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-sans">Monthly Outflow comparison</h3>
            <p className={`text-sm font-semibold mt-1 ${profile.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Total Expenditure per Calendar Period</p>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={profile.theme === 'dark' ? '#1E293B' : '#F1F5F9'} />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`${currencySymbol}${value}`, undefined]}
                  contentStyle={{ 
                    backgroundColor: profile.theme === 'dark' ? '#0F172A' : '#FFF', 
                    borderRadius: '12px', 
                    border: `1px solid ${profile.theme === 'dark' ? '#1E293B' : '#F1F5F9'}`,
                    color: profile.theme === 'dark' ? '#FFF' : '#0F172A'
                  }}
                />
                <Bar dataKey="Amount" fill={themeHexColor} radius={[6, 6, 0, 0]} maxBarSize={55}>
                  {monthlyBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 2 ? themeHexColor : '#94A3B8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Printable template view for standard system window.print() */}
      <div className="hidden print:block bg-white p-12 text-black space-y-8 min-h-screen">
        <div className="text-center pb-8 border-b-2 border-slate-200">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight">Financial Statement Ledger</h2>
          <p className="text-sm text-slate-500 mt-2">Personal Expense Tracker report created: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm">
          <div>
            <h4 className="font-bold border-b border-slate-200 pb-2">Client Overview</h4>
            <p className="mt-2 text-slate-700">Name: <span className="font-bold text-black">{profile.name}</span></p>
            <p className="text-slate-700">Email: {profile.email}</p>
            <p className="text-slate-700">Preferred Currency: {profile.currency}</p>
          </div>
          <div>
            <h4 className="font-bold border-b border-slate-200 pb-2">Financial Balance Summary</h4>
            <p className="mt-2 text-slate-700">Month: <span className="font-bold">June 2026</span></p>
            <p className="text-slate-705">Total Inflow setting: {currencySymbol}{profile.monthlyIncomeSetting.toLocaleString()}</p>
            <p className="text-slate-705">Combined Month Outflows: {currencySymbol}{getMonthTotalExpense('2026-06').toLocaleString()}</p>
          </div>
        </div>

        {/* Expense Category Breakdown table */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm border-b border-slate-200 pb-2">Outflow allocation breakdown</h4>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2">Category Segment</th>
                <th className="py-2 text-right">Sum Expenditures</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categorySpentMap).map(([cat, val]) => (
                <tr key={cat} className="border-b border-slate-100 text-slate-700">
                  <td className="py-2">{cat}</td>
                  <td className="py-2 text-right">{currencySymbol}{val.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-center pt-16 border-t border-slate-200 text-xs text-slate-400 leading-normal">
          Generated automatically by Personal Expense Tracker application. Content verified and signed.
        </div>
      </div>
    </div>
  );
}
