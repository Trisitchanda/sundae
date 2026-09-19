import Category from '../models/Category.js';
import AiInsight from '../models/AiInsight.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { invalidateUserCache } from '../middleware/cacheMiddleware.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({
      $or: [{ userId: req.user.id }, { isDefault: true }]
    }).sort({ name: 1 }).lean();

    const user = await User.findById(req.user.id);
    const budgets = user.categoryBudgets || new Map();

    const mappedCategories = categories.map(cat => ({
      ...cat,
      budgetLimit: budgets.has(cat._id.toString()) ? budgets.get(cat._id.toString()) : null
    }));

    res.json({ success: true, data: mappedCategories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const category = await Category.create({ userId: req.user.id, name });
    
    // Invalidate AI cache and Redis categories cache
    await AiInsight.updateMany({ userId: req.user.id }, { $set: { isStale: true } });
    await invalidateUserCache(req.user.id, 'categories');

    res.status(201).json({ success: true, data: { ...category.toObject(), budgetLimit: null } });
  } catch (error) {
    if (error.code === 11000) return next(new AppError('Category already exists', 400));
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { budgetLimit } = req.body;

    const category = await Category.findOne({ 
      _id: id, 
      $or: [{ userId: req.user.id }, { isDefault: true }] 
    });
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    const user = await User.findById(req.user.id);

    if (budgetLimit === null || budgetLimit === undefined) {
      user.categoryBudgets.delete(id);
    } else {
      user.categoryBudgets.set(id, budgetLimit);
    }

    await user.save();

    // Invalidate AI cache and Redis caches
    await AiInsight.updateMany({ userId: req.user.id }, { $set: { isStale: true } });
    await invalidateUserCache(req.user.id, 'categories', 'analytics');

    res.json({ success: true, data: { ...category.toObject(), budgetLimit } });
  } catch (error) {
    next(error);
  }
};
