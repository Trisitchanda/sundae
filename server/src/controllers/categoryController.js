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
    const budgets = user?.categoryBudgets || new Map();

    const mappedCategories = categories.map(cat => ({
      ...cat,
      budgetLimit: budgets.has(cat._id.toString()) ? budgets.get(cat._id.toString()) : null
    }));

    // Deduplicate by name (case-insensitive); prioritize user-specific category if both exist
    const categoryMap = new Map();
    for (const cat of mappedCategories) {
      const normalizedName = cat.name.trim().toLowerCase();
      if (!categoryMap.has(normalizedName)) {
        categoryMap.set(normalizedName, cat);
      } else {
        const existing = categoryMap.get(normalizedName);
        if (!cat.isDefault && existing.isDefault) {
          categoryMap.set(normalizedName, cat);
        }
      }
    }

    res.json({ success: true, data: Array.from(categoryMap.values()) });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const trimmedName = name.trim();

    // Check if category already exists either as a default or for this user (case-insensitive)
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') },
      $or: [{ userId: req.user.id }, { isDefault: true }]
    });
    if (existing) {
      return next(new AppError('Category already exists', 400));
    }

    const category = await Category.create({ userId: req.user.id, name: trimmedName });
    
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
