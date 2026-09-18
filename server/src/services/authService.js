import User from '../models/User.js';
import Session from '../models/Session.js';
import SecurityEventLog from '../models/SecurityEventLog.js';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken, hashToken } from '../utils/tokens.js';
import logger from '../utils/logger.js';
import AppError from '../utils/AppError.js';

const logSecurityEvent = async (userId, event, ip, userAgent) => {
  try {
    await SecurityEventLog.create({ userId, event, ip, userAgent });
  } catch (err) {
    logger.error('Failed to log security event', err);
  }
};

import Category from '../models/Category.js';
import Account from '../models/Account.js';

const registerUser = async (email, password, ip, userAgent) => {
  if (process.env.ALLOW_REGISTRATION !== 'true') {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      throw new AppError('Registration is currently disabled.', 403);
    }
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    email,
    passwordHash,
    role: 'USER', // First user could be made ADMIN, but keeping simple for now
  });

  // Create default Account and Categories
  await Account.create({
    userId: user._id,
    name: 'Main Bank Account',
    type: 'BANK',
    balance: 0,
    isDefault: true
  });

  const defaultCategories = ['Food', 'Transport', 'Utilities', 'Salary', 'Entertainment'].map(name => ({
    userId: user._id,
    name,
    isDefault: false
  }));
  await Category.insertMany(defaultCategories);

  await logSecurityEvent(user._id, 'ACCOUNT_CREATED', ip, userAgent);
  return user;
};

const loginUser = async (email, password, ip, userAgent) => {
  const user = await User.findOne({ email });
  if (!user) {
    await logSecurityEvent(null, 'LOGIN_FAILED_UNKNOWN_USER', ip, userAgent);
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    await logSecurityEvent(user._id, 'LOGIN_FAILED_BAD_PASSWORD', ip, userAgent);
    throw new AppError('Invalid credentials', 401);
  }

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashToken(refreshToken);

  // Expire refresh token in 7 days
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Session.create({
    userId: user._id,
    refreshTokenHash,
    userAgent,
    ip,
    expiresAt,
  });

  await logSecurityEvent(user._id, 'LOGIN_SUCCESS', ip, userAgent);

  return { user, accessToken, refreshToken };
};

const refreshSession = async (oldRefreshToken, ip, userAgent) => {
  if (!oldRefreshToken) throw new AppError('No refresh token provided', 401);

  const refreshTokenHash = hashToken(oldRefreshToken);
  const session = await Session.findOne({ refreshTokenHash }).populate('userId');

  if (!session || session.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = session.userId;
  
  // Revoke old session
  await Session.deleteOne({ _id: session._id });

  // Generate new tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken();
  const newRefreshTokenHash = hashToken(newRefreshToken);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await Session.create({
    userId: user._id,
    refreshTokenHash: newRefreshTokenHash,
    userAgent,
    ip,
    expiresAt,
  });

  return { accessToken, refreshToken: newRefreshToken };
};

const logoutUser = async (refreshToken, userId, ip, userAgent) => {
  if (refreshToken) {
    const refreshTokenHash = hashToken(refreshToken);
    await Session.deleteOne({ refreshTokenHash });
  }
  await logSecurityEvent(userId, 'LOGOUT', ip, userAgent);
};

const changePassword = async (userId, currentPassword, newPassword, ip, userAgent) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    await logSecurityEvent(userId, 'PASSWORD_CHANGE_FAILED', ip, userAgent);
    throw new AppError('Invalid current password', 400);
  }

  const salt = await bcrypt.genSalt(12);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  // Revoke all sessions
  await Session.deleteMany({ userId });
  await logSecurityEvent(userId, 'PASSWORD_CHANGED', ip, userAgent);
  await logSecurityEvent(userId, 'ALL_SESSIONS_REVOKED', ip, userAgent);
};

export {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
  changePassword,
};
