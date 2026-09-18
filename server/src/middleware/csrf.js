import crypto from 'crypto';

const csrfProtection = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    if (!req.cookies._csrf) {
      const token = crypto.randomBytes(32).toString('hex');
      res.cookie('_csrf', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie('XSRF-TOKEN', token, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000,
      });
    }
    return next();
  }

  const csrfCookie = req.cookies._csrf;
  const csrfHeader = req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];
  
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
  }

  next();
};

export { csrfProtection };
