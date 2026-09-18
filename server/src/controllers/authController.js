const authService = require('../services/authService');
const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 min
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh', // only sent on refresh endpoint
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

exports.register = async (req, res, next) => {
  try {
    const { email, password } = registerSchema.parse(req.body);
    const user = await authService.registerUser(email, password, req.ip, req.headers['user-agent']);
    res.status(201).json({ success: true, data: { id: user._id, email: user.email } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: 'Invalid input data' });
    if (error.message === 'Email already registered' || error.message === 'Registration is currently disabled.') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password, req.ip, req.headers['user-agent']);
    
    setCookies(res, accessToken, refreshToken);
    
    res.status(200).json({ success: true, data: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: 'Invalid input data' });
    if (error.message === 'Invalid credentials') return res.status(401).json({ success: false, message: error.message });
    next(error);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    const { accessToken, refreshToken } = await authService.refreshSession(oldRefreshToken, req.ip, req.headers['user-agent']);
    
    setCookies(res, accessToken, refreshToken);
    
    res.status(200).json({ success: true, message: 'Session refreshed' });
  } catch (error) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    await authService.logoutUser(refreshToken, req.user?.id, req.ip, req.headers['user-agent']);
    
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res, next) => {
  try {
    // req.user is set by auth middleware
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    await authService.changePassword(req.user.id, currentPassword, newPassword, req.ip, req.headers['user-agent']);
    
    // Revoke current session cookies since all sessions were revoked
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    
    res.status(200).json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: 'Invalid input data' });
    if (error.message === 'Invalid current password') return res.status(400).json({ success: false, message: error.message });
    next(error);
  }
};
