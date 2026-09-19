import * as authService from '../services/authService.js';
import User from '../models/User.js';

const isProduction = process.env.NODE_ENV?.toLowerCase() === 'production' || process.env.RENDER === 'true';

const getCookieOptions = (req) => {
  const isSecure = isProduction || req?.secure || req?.headers?.['x-forwarded-proto'] === 'https';
  return {
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
  };
};

const setCookies = (req, res, accessToken, refreshToken) => {
  const baseOptions = getCookieOptions(req);

  res.cookie('accessToken', accessToken, {
    ...baseOptions,
    httpOnly: true,
    maxAge: 15 * 60 * 1000, // 15 min
  });

  res.cookie('refreshToken', refreshToken, {
    ...baseOptions,
    httpOnly: true,
    path: '/api/auth/refresh', // only sent on refresh endpoint
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.registerUser(email, password, req.ip, req.headers['user-agent']);
    res.status(201).json({ success: true, data: { id: user._id, email: user.email } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser(email, password, req.ip, req.headers['user-agent']);
    
    setCookies(req, res, accessToken, refreshToken);
    
    res.status(200).json({ success: true, data: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    const { accessToken, refreshToken } = await authService.refreshSession(oldRefreshToken, req.ip, req.headers['user-agent']);
    
    setCookies(req, res, accessToken, refreshToken);
    
    res.status(200).json({ success: true, message: 'Session refreshed' });
  } catch (error) {
    const cookieOptions = getCookieOptions(req);
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', { ...cookieOptions, path: '/api/auth/refresh' });
    res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    await authService.logoutUser(refreshToken, req.user?.id, req.ip, req.headers['user-agent']);
    
    const cookieOptions = getCookieOptions(req);
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', { ...cookieOptions, path: '/api/auth/refresh' });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const me = async (req, res, next) => {
  try {
    // req.user is set by auth middleware

    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword, req.ip, req.headers['user-agent']);
    
    // Revoke current session cookies since all sessions were revoked
    const cookieOptions = getCookieOptions(req);
    res.clearCookie('accessToken', cookieOptions);
    res.clearCookie('refreshToken', { ...cookieOptions, path: '/api/auth/refresh' });
    
    res.status(200).json({ success: true, message: 'Password changed successfully. Please log in again.' });
  } catch (error) {
    next(error);
  }
};
