import Account from '../models/Account.js';
import { invalidateUserCache } from '../middleware/cacheMiddleware.js';

export const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ userId: req.user.id }).sort({ createdAt: 1 });
    res.json({ success: true, data: accounts });
  } catch (error) {
    next(error);
  }
};

export const createAccount = async (req, res, next) => {
  try {
    const { name, type, balance, creditLimit } = req.body;
    const account = await Account.create({
      userId: req.user.id,
      name,
      type,
      balance: balance || 0,
      creditLimit: creditLimit || null
    });
    
    await invalidateUserCache(req.user.id, 'accounts');

    res.status(201).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};
