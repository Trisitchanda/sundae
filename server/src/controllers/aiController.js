const rateLimit = require('express-rate-limit');
const { OpenAI } = require('openai');
const mongoose = require('mongoose');
const User = require('../models/User');
const AiInsight = require('../models/AiInsight');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const budgetService = require('../services/budgetService');

// Helper to calculate totals for a given month
const getMonthData = async (userIdObj, y, m, fallbackBaseSalary) => {
  const incomeAgg = await Transaction.aggregate([
    { $match: { userId: userIdObj, year: y, month: m, type: 'INCOME' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const actualIncome = incomeAgg.length > 0 ? incomeAgg[0].total : 0;
  const totalIncome = actualIncome + fallbackBaseSalary;

  const expenseAgg = await Transaction.aggregate([
    { $match: { userId: userIdObj, year: y, month: m, type: { $in: ['EXPENSE', 'REFUND'] } } },
    { 
      $group: { 
        _id: null, 
        totalSpent: { 
          $sum: { $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', { $multiply: ['$amount', -1] }] } 
        }
      } 
    }
  ]);
  const totalSpent = expenseAgg.length > 0 ? expenseAgg[0].totalSpent : 0;

  const ccAccounts = await Account.find({ userId: userIdObj, type: 'CREDIT_CARD' });
  const outstandingCredit = ccAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  const remaining = totalIncome - totalSpent;
  const savingsRate = totalIncome > 0 ? ((remaining / totalIncome) * 100) : 0;

  return { totalIncome, totalSpent, outstandingCredit, remaining, savingsRate };
};

const getCategoryBreakdown = async (userIdObj, y, m) => {
  const data = await Transaction.aggregate([
    { $match: { userId: userIdObj, year: y, month: m, type: { $in: ['EXPENSE', 'REFUND'] } } },
    { 
      $group: { 
        _id: '$categoryId', 
        total: { $sum: { $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', { $multiply: ['$amount', -1] }] } } 
      } 
    },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, categoryId: '$_id', name: { $ifNull: ['$category.name', 'Uncategorized'] }, amount: '$total' } },
    { $match: { amount: { $gt: 0 } } },
    { $sort: { amount: -1 } }
  ]);

  const user = await User.findById(userIdObj);
  const budgets = user.categoryBudgets || new Map();

  return data.map(item => ({
    ...item,
    budgetLimit: item.categoryId && budgets.has(item.categoryId.toString()) ? budgets.get(item.categoryId.toString()) : null
  }));
};

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  handler: (req, res, next, options) => {
    req.rateLimitError = options.message;
    next();
  }
});

exports.analyze = async (req, res, next) => {
  try {
    const { period, forceRefresh } = req.body;
    if (!period) return res.status(400).json({ success: false, message: 'Period required' });
    
    const userIdObj = new mongoose.Types.ObjectId(req.user.id);
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(503).json({ success: false, message: 'OpenAI API key is missing. Please configure OPENAI_API_KEY in the environment.' });
    }

    let cached = await AiInsight.findOne({ userId: userIdObj, period });
    
    if (!forceRefresh && cached) {
      if (!cached.isStale && cached.expiresAt > new Date()) {
        return res.json({ success: true, data: cached.insightData, cached: true, generatedAt: cached.generatedAt, budgetSnapshot: cached.budgetSnapshot });
      }
      if (cached.isGenerating) {
        if (cached.insightData && Object.keys(cached.insightData).length > 0) {
          return res.json({ success: true, data: cached.insightData, cached: true, generatedAt: cached.generatedAt, budgetSnapshot: cached.budgetSnapshot });
        }
        return res.status(202).json({ success: true, message: 'Insights are currently generating.', data: null });
      }
    }

    await new Promise(resolve => aiLimiter(req, res, resolve));
    if (req.rateLimitError) {
      return res.status(429).json(req.rateLimitError);
    }

    if (cached) {
      cached = await AiInsight.findOneAndUpdate(
        { _id: cached._id, isGenerating: false },
        { $set: { isGenerating: true } },
        { new: true }
      );
      if (!cached) {
        const currentCache = await AiInsight.findOne({ userId: userIdObj, period });
        return res.json({ success: true, data: currentCache?.insightData, cached: true, generatedAt: currentCache?.generatedAt, budgetSnapshot: currentCache?.budgetSnapshot });
      }
    } else {
      cached = await AiInsight.create({
        userId: userIdObj,
        period,
        isGenerating: true,
        insightData: {},
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000)
      });
    }

    try {
      const currentDate = new Date();
      let currentY = currentDate.getFullYear();
      let currentM = currentDate.getMonth() + 1;
      let prevY = currentY;
      let prevM = currentM - 1;
      if (prevM === 0) {
        prevM = 12;
        prevY -= 1;
      }

      const user = await User.findById(req.user.id);
      const baseSalary = user.baseSalary || 0;

      const currentData = await getMonthData(userIdObj, currentY, currentM, baseSalary);
      const prevData = await getMonthData(userIdObj, prevY, prevM, baseSalary);
      
      const currentCategories = await getCategoryBreakdown(userIdObj, currentY, currentM);
      const prevCategories = await getCategoryBreakdown(userIdObj, prevY, prevM);

      const categoriesData = currentCategories.map(currCat => {
        const prevCat = prevCategories.find(p => p.name === currCat.name);
        const prevAmount = prevCat ? prevCat.amount : 0;
        let changePercent = 0;
        if (prevAmount > 0) {
          changePercent = ((currCat.amount - prevAmount) / prevAmount) * 100;
        } else if (currCat.amount > 0) {
          changePercent = 100;
        }
        return {
          categoryId: currCat.categoryId.toString(),
          name: currCat.name,
          amount: currCat.amount / 100,
          changePercent: Math.round(changePercent),
          budgetLimit: currCat.budgetLimit != null ? currCat.budgetLimit / 100 : null
        };
      });

      const spendingChange = prevData.totalSpent > 0 
        ? ((currentData.totalSpent - prevData.totalSpent) / prevData.totalSpent) * 100 
        : 0;

      const effectiveIncomeRaw = Math.max(currentData.totalIncome, user.baseSalary || 0);

      const budgetSnapshot = budgetService.calculateBudgetPlan({
        income: effectiveIncomeRaw / 100,
        savingsGoalRate: user.savingsGoalRate != null ? user.savingsGoalRate : 0.50,
        categoriesData
      });
      
      // Inject spendingChange into budgetSnapshot to send to OpenAI context
      budgetSnapshot.spendingChange = Number(spendingChange.toFixed(1));

      const openai = new OpenAI({ apiKey });

      const systemInstruction = `You are Sundae's financial insights interpreter.

The provided financial numbers and budget allocations have already been calculated by Sundae's deterministic budget engine.
All currencies are in INR (e.g., ₹5,000). Never use USD or $.

You MUST NOT:
- calculate or modify budget allocations
- increase or decrease a budgetLimit or recommendedBudget
- invent financial figures
- override hard category limits
- recommend an amount above a provided budgetLimit
- recalculate the user's savings target
- do any math on the budget constraints.

You MUST:
- explain the provided numbers
- identify notable spending patterns
- explain whether the user is within or above their limits for each category based solely on the provided 'spent', 'budgetLimit', and 'recommendedBudget'
- provide concise actionable suggestions in 'categoryInsights'
- use categoryId exactly as provided
- return valid structured output.`;

      const jsonSchema = {
        name: "financial_insight",
        strict: true,
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            categoryInsights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  categoryId: { type: "string" },
                  suggestion: { type: "string", description: "A concise 1-2 sentence tip/advice for this specific category, explaining how they are doing against their budget limit." }
                },
                additionalProperties: false,
                required: ["categoryId", "suggestion"]
              }
            }
          },
          additionalProperties: false,
          required: ["summary", "categoryInsights"]
        }
      };

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: JSON.stringify({ budgetPlan: budgetSnapshot }) }
        ],
        response_format: {
          type: "json_schema",
          json_schema: jsonSchema
        }
      });

      const cleanText = response.choices[0].message.content;
      
      let resultJson;
      try {
        resultJson = JSON.parse(cleanText);
      } catch (parseErr) {
        console.error('Failed to parse OpenAI JSON:', cleanText);
        throw new Error('AI returned an invalid response format.');
      }

      const validIds = new Set(categoriesData.map(c => c.categoryId));
      if (resultJson.categoryInsights) {
        resultJson.categoryInsights = resultJson.categoryInsights.filter(item => validIds.has(item.categoryId));
      }

      const generatedAt = new Date();
      const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);
      
      await AiInsight.findByIdAndUpdate(cached._id, {
        insightData: resultJson,
        budgetSnapshot,
        isStale: false,
        isGenerating: false,
        generatedAt,
        expiresAt
      });

      res.json({ success: true, data: resultJson, cached: false, generatedAt, budgetSnapshot });
    } catch (genErr) {
      await AiInsight.findByIdAndUpdate(cached._id, { isGenerating: false });
      return res.status(500).json({ success: false, message: genErr.message || 'Failed to generate AI insights.' });
    }
  } catch (error) {
    next(error);
  }
};
