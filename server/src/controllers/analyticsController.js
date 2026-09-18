import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import User from '../models/User.js';

export const getSummary = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ success: false, message: 'Year and month required' });
    
    const y = Number(year);
    const m = Number(month);
    
    const userIdObj = new mongoose.Types.ObjectId(req.user.id);
    const user = await User.findById(req.user.id);
    
    // Total income from INCOME transactions this month
    const incomeAgg = await Transaction.aggregate([
      { $match: { userId: userIdObj, year: y, month: m, type: 'INCOME' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const actualIncome = incomeAgg.length > 0 ? incomeAgg[0].total : 0;
    
    let fallbackIncome = 0;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const userYear = user.createdAt.getFullYear();
    const userMonth = user.createdAt.getMonth() + 1;
    
    const isPastOrCurrent = y < currentYear || (y === currentYear && m <= currentMonth);
    const isAfterJoin = y > userYear || (y === userYear && m >= userMonth);
    
    if (isPastOrCurrent && isAfterJoin) {
      fallbackIncome = user.baseSalary || 0;
    }
    
    const totalIncome = actualIncome + fallbackIncome;

    // Total expenses this month (EXPENSE minus REFUND)
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

    // Outstanding Credit (total debt on CREDIT_CARD accounts)
    const ccAccounts = await Account.find({ userId: userIdObj, type: 'CREDIT_CARD' });
    const outstandingCredit = ccAccounts.reduce((sum, acc) => sum + acc.balance, 0);

    const remaining = totalIncome - totalSpent;
    const savingsPercentage = totalIncome > 0 ? ((remaining / totalIncome) * 100).toFixed(1) : 0;

    const recentTransactions = await Transaction.find({ userId: userIdObj, year: y, month: m })
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
      .populate('categoryId', 'name')
      .populate('accountId', 'name type')
      .populate('sourceAccountId', 'name type')
      .populate('destinationAccountId', 'name type');

    res.json({
      success: true,
      data: {
        totalIncome,
        totalSpent,
        outstandingCredit,
        remaining,
        savingsPercentage: Number(savingsPercentage),
        recentTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBreakdown = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ success: false, message: 'Year and month required' });
    
    const userIdObj = new mongoose.Types.ObjectId(req.user.id);

    // Only include EXPENSE and REFUND in category breakdown
    const breakdown = await Transaction.aggregate([
      { $match: { userId: userIdObj, year: Number(year), month: Number(month), type: { $in: ['EXPENSE', 'REFUND'] } } },
      { 
        $group: { 
          _id: '$categoryId', 
          total: { $sum: { $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', { $multiply: ['$amount', -1] }] } } 
        } 
      },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, categoryId: '$_id', categoryName: { $ifNull: ['$category.name', 'Uncategorized'] }, total: 1 } },
      { $match: { total: { $gt: 0 } } }, // Filter out refunded/zeroed categories
      { $sort: { total: -1 } }
    ]);

    const user = await User.findById(req.user.id);
    const budgets = user.categoryBudgets || new Map();

    const result = breakdown.map(item => ({
      ...item,
      budgetLimit: item.categoryId && budgets.has(item.categoryId.toString()) ? budgets.get(item.categoryId.toString()) : null
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyTrend = async (req, res, next) => {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ success: false, message: 'Year required' });
    const y = Number(year);
    const userIdObj = new mongoose.Types.ObjectId(req.user.id);

    const expenseTrend = await Transaction.aggregate([
      { $match: { userId: userIdObj, year: y, type: { $in: ['EXPENSE', 'REFUND'] } } },
      { 
        $group: { 
          _id: '$month', 
          spent: { $sum: { $cond: [{ $eq: ['$type', 'EXPENSE'] }, '$amount', { $multiply: ['$amount', -1] }] } } 
        } 
      }
    ]);

    const incomeTrend = await Transaction.aggregate([
      { $match: { userId: userIdObj, year: y, type: 'INCOME' } },
      { $group: { _id: '$month', income: { $sum: '$amount' } } }
    ]);

    const user = await User.findById(req.user.id);
    const baseSalary = user.baseSalary || 0;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const userYear = user.createdAt.getFullYear();
    const userMonth = user.createdAt.getMonth() + 1;

    const result = [];
    for (let m = 1; m <= 12; m++) {
      const e = expenseTrend.find(x => x._id === m);
      const i = incomeTrend.find(x => x._id === m);
      
      let fallbackIncome = 0;
      const isPastOrCurrent = y < currentYear || (y === currentYear && m <= currentMonth);
      const isAfterJoin = y > userYear || (y === userYear && m >= userMonth);
      
      if (isPastOrCurrent && isAfterJoin) {
        fallbackIncome = baseSalary;
      }

      result.push({
        month: m,
        spent: e ? e.spent : 0,
        income: fallbackIncome + (i ? i.income : 0)
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
