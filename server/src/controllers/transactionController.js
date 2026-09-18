import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';
import Category from '../models/Category.js';
import AppError from '../utils/AppError.js';

// Helper to update account balance based on transaction logic
const updateAccountBalance = async (accountId, amount, isDeduction) => {
  if (!accountId) return;
  const account = await Account.findById(accountId);
  if (!account) return;
  
  const isCC = account.type === 'CREDIT_CARD';
  
  let change = 0;
  if (isDeduction) {
    change = isCC ? amount : -amount;
  } else {
    change = isCC ? -amount : amount;
  }
  
  account.balance += change;
  await account.save();
};

export const getTransactions = async (req, res, next) => {
  try {
    const { month, year, sort, page, limit, search, categoryId } = req.query;
    const query = { userId: req.user.id };
    
    if (month && year) {
      query.month = parseInt(month);
      query.year = parseInt(year);
    }

    if (categoryId && categoryId !== 'all') {
      query.categoryId = categoryId;
    }

    if (search) {
      query.$or = [
        { description: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = sort === 'asc' ? 1 : -1;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Transaction.countDocuments(query);

    const transactions = await Transaction.find(query)
      .sort({ date: sortOrder, createdAt: sortOrder })
      .skip(skip)
      .limit(limitNum)
      .populate('categoryId', 'name')
      .populate('accountId', 'name type')
      .populate('sourceAccountId', 'name type')
      .populate('destinationAccountId', 'name type');
      
    res.json({ 
      success: true, 
      data: transactions,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const { type, amount, date, description, categoryId, accountId, sourceAccountId, destinationAccountId, originalTransactionId, notes } = req.body;
    
    const parsedDate = new Date(date);
    const month = parsedDate.getMonth() + 1;
    const year = parsedDate.getFullYear();
    
    // Verify ownership of accounts
    const accountIds = [accountId, sourceAccountId, destinationAccountId].filter(id => id);
    if (accountIds.length > 0) {
      // Create a unique array of account IDs to check
      const uniqueAccountIds = [...new Set(accountIds)];
      const accountsCount = await Account.countDocuments({ _id: { $in: uniqueAccountIds }, userId: req.user.id });
      if (accountsCount !== uniqueAccountIds.length) {
        throw new AppError('One or more accounts not found or do not belong to you', 403);
      }
    }

    // Verify ownership of category
    if (categoryId) {
      const category = await Category.findOne({ _id: categoryId, $or: [{ userId: req.user.id }, { isDefault: true }] });
      if (!category) {
        throw new AppError('Category not found or does not belong to you', 403);
      }
    }
    
    const transaction = await Transaction.create([{
      userId: req.user.id,
      type,
      amount: parseInt(amount),
      date: parsedDate,
      month,
      year,
      description,
      categoryId,
      accountId,
      sourceAccountId,
      destinationAccountId,
      originalTransactionId,
      notes
    }]);

    // Apply balances
    if (type === 'EXPENSE') {
      await updateAccountBalance(accountId, parseInt(amount), true);
    } else if (type === 'INCOME' || type === 'REFUND') {
      await updateAccountBalance(accountId, parseInt(amount), false);
    } else if (type === 'TRANSFER') {
      await updateAccountBalance(sourceAccountId, parseInt(amount), true);
      await updateAccountBalance(destinationAccountId, parseInt(amount), false);
    }
    
    res.status(201).json({ success: true, data: transaction[0] });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user.id });
    if (!transaction) {
      return next(new AppError('Transaction not found', 404));
    }
    
    // Reverse balances
    const amount = transaction.amount;
    if (transaction.type === 'EXPENSE') {
      await updateAccountBalance(transaction.accountId, amount, false);
    } else if (transaction.type === 'INCOME' || transaction.type === 'REFUND') {
      await updateAccountBalance(transaction.accountId, amount, true);
    } else if (transaction.type === 'TRANSFER') {
      await updateAccountBalance(transaction.sourceAccountId, amount, false);
      await updateAccountBalance(transaction.destinationAccountId, amount, true);
    }
    
    await Transaction.deleteOne({ _id: req.params.id });
    
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    next(error);
  }
};
