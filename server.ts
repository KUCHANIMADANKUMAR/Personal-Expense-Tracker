import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

// Initialize Express app
async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse incoming JSON bodies
  app.use(express.json());

  // Shared lazy-loaded Gemini client getter
  function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // API endpoint: Get Smart Client Insights & Wealth Advisory
  app.post('/api/insights', async (req, res) => {
    try {
      const { expenses, income, budgets, savingsGoals, userProfile } = req.body;

      // Ensure basic arrays are present
      const safeExpenses = expenses || [];
      const safeIncome = income || [];
      const safeBudgets = budgets || [];
      const safeSavingsGoals = savingsGoals || [];
      const safeProfile = userProfile || { monthlyIncomeSetting: 125000, currency: 'INR' };

      const currencySymbolMap: Record<string, string> = {
        INR: '₹', PKR: '₨', BDT: '৳', LKR: 'රු', NPR: '₨', BTN: 'Nu.', MMK: 'Ks', MVR: 'Rf', AFN: '؋', CNY: '¥'
      };
      const curSym = currencySymbolMap[safeProfile.currency] || '₹';

      // Make analytical summary locally to guide AI or act as robust custom fallback
      const totalIncome = safeIncome.reduce((acc: number, inc: any) => acc + Number(inc.amount), 0);
      const totalExpense = safeExpenses.reduce((acc: number, exp: any) => acc + Number(exp.amount), 0);
      const netSavings = totalIncome - totalExpense;
      const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

      // Group expenses by category
      const categoryTotals: Record<string, number> = {};
      safeExpenses.forEach((exp: any) => {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + Number(exp.amount);
      });

      // Find highest category
      let highestCategory = 'None';
      let maxAmount = 0;
      Object.entries(categoryTotals).forEach(([cat, val]) => {
        if (val > maxAmount) {
          maxAmount = val;
          highestCategory = cat;
        }
      });

      // Check current budget overruns
      const overspentCategories: string[] = [];
      safeBudgets.forEach((b: any) => {
        const spent = categoryTotals[b.category] || 0;
        if (spent > b.limit) {
          overspentCategories.push(`${b.category} (Spent: ${curSym}${spent.toFixed(0)} / Limit: ${curSym}${b.limit.toFixed(0)})`);
        }
      });

      // Create local fallback advisor advice
      const financialHealthScore = Math.max(0, Math.min(100, Math.round(50 + (savingsRate / 2) - (overspentCategories.length * 10))));

      const defaultRecommendations = [
        `Save more by reducing expenditures in high-velocity categories like ${highestCategory || 'Shopping'}.`,
        overspentCategories.length > 0 
          ? `Urgent attention: You have overspent in ${overspentCategories.join(', ')}. Set tighter category caps.`
          : 'Great job staying inside your limits! Try to allocate 10% more to long-term deposits and gold standard instruments.',
        safeSavingsGoals.length > 0
          ? `Track your goals consistently. Your active target landmarks are crucial safety anchors.`
          : 'Set up at least one short-term and one long-term savings goal to automate allocation.'
      ];

      const defaultSummary = `Based on your recent financial trends, your total income reached ${curSym}${totalIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })} vs expenditures of ${curSym}${totalExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}. This results in a positive savings rate of ${savingsRate}%. Your biggest expense category was ${highestCategory}.`;

      // Try lazy initializing Google GenAI
      const ai = getGeminiClient();

      if (ai) {
        // Prepare prompt representing the exact user financial state
        const prompt = `
          You are an expert personal wealth advisor & financial master assistant. Analyze the user's financial details below and output highly customized wealth tips, a score, and actionable advice.

          ### Financial Statement
          - User name: ${safeProfile.name || 'User'}
          - Base Monthly Income Cap: ${safeProfile.monthlyIncomeSetting}
          - Date Range: Recent transactions (April - June 2026)
          - Currency: ${safeProfile.currency}
          - Total Verified Income (All periods combined): ${safeProfile.currency} ${totalIncome.toFixed(2)}
          - Total Verified Expenditures (All periods combined): ${safeProfile.currency} ${totalExpense.toFixed(2)}
          - Calculated Unlocked Savings: ${safeProfile.currency} ${netSavings.toFixed(2)} (Savings Rate of ${savingsRate}%)
          
          ### Category Breakdown of Spent Amounts
          ${JSON.stringify(categoryTotals, null, 2)}

          ### Active Monthly Limits & Budgets
          ${JSON.stringify(safeBudgets, null, 2)}

          ### Active Savings Goals (Progress & Target)
          ${JSON.stringify(safeSavingsGoals, null, 2)}

          ### Warnings & Concerns
          - Overspent budgets: ${overspentCategories.length > 0 ? overspentCategories.join(', ') : 'None! Perfect budget pacing.'}

          Analyze carefully and write a financial report in structured JSON format according to responseSchema.
          - financialHealthScore should be a rating from 0 to 100 based on savings, budget pacing, and debt indicators.
          - highestCategory must name the top category.
          - recommendations should contain exactly 3-4 custom targeted financial action items.
          - summary should be an authoritative 3-sentence summary of their current cash flow and recommendations for future savings.
        `;

        try {
          const apiResponse = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  healthScore: {
                    type: Type.INTEGER,
                    description: 'Financial wellness index from 0 to 100.'
                  },
                  highestCategory: {
                    type: Type.STRING,
                    description: 'The category with highest spending.'
                  },
                  spendingChangePercent: {
                    type: Type.NUMBER,
                    description: 'Analytical value indicating ratio of total expenditure against income.'
                  },
                  recommendations: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '3 or 4 tailored, actionable wealth tips.'
                  },
                  summary: {
                    type: Type.STRING,
                    description: 'Professional executive summary of financial health.'
                  }
                },
                required: ['healthScore', 'highestCategory', 'spendingChangePercent', 'recommendations', 'summary']
              }
            }
          });

          if (apiResponse.text) {
            const data = JSON.parse(apiResponse.text.trim());
            return res.json({
              healthScore: data.healthScore ?? financialHealthScore,
              highestCategory: data.highestCategory ?? highestCategory,
              spendingChangePercent: data.spendingChangePercent ?? Math.round((totalExpense / (totalIncome || 1)) * 100),
              recommendations: data.recommendations ?? defaultRecommendations,
              summary: data.summary ?? defaultSummary,
              isActualAI: true
            });
          }
        } catch (geminiError: any) {
          console.error('Error generating AI contents via Gemini:', geminiError);
          // Gently proceed with fallback data rather than failing
        }
      }

      // Return consistent fallback if client is null or key is invalid
      return res.json({
        healthScore: financialHealthScore,
        highestCategory,
        spendingChangePercent: Math.round((totalExpense / (totalIncome || 1)) * 100),
        recommendations: defaultRecommendations,
        summary: defaultSummary + " (Calculated via high-precision client metrics; setup Gemini API keys in Secrets to unleash AI-narrative reports!)",
        isActualAI: false
      });

    } catch (err: any) {
      console.error('Server side insights route crashed:', err);
      return res.status(500).json({ error: 'Server crashed processing metrics', message: err.message });
    }
  });

  // Enable dynamic Vite development serving or production assets
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Expense Tracker server booted gracefully and listening on port ${PORT}`);
  });
}

startServer();
