import crypto from 'crypto';

const csrfProtection = (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    let token = req.cookies._csrf;
    if (!token) {
      token = crypto.randomBytes(32).toString('hex');
      const isProduction = process.env.NODE_ENV?.toLowerCase() === 'production' || process.env.RENDER === 'true';
      const isSecure = isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https';
      const cookieOptions = {
        secure: isSecure,
        sameSite: isSecure ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      };

      res.cookie('_csrf', token, {
        ...cookieOptions,
        httpOnly: true,
      });
      res.cookie('XSRF-TOKEN', token, {
        ...cookieOptions,
        httpOnly: false,
      });
    }

    res.setHeader('X-CSRF-Token', token);
    return next();
  }

  // Exempt initial auth endpoints (protected by credentials and rate limiting)
  if (req.path.endsWith('/login') || req.path.endsWith('/register') || req.path.endsWith('/refresh')) {
    return next();
  }

  // 1. Origin verification (standard OWASP defense against cross-site request forgery)
  const origin = req.headers.origin;
  const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/+$/, '') : null;
  const isAllowedOrigin = origin && (
    origin === 'https://sundae-green.vercel.app' ||
    origin === 'http://localhost:5173' ||
    (clientUrl && origin === clientUrl)
  );

  if (isAllowedOrigin) {
    return next();
  }

  // 2. Double-Submit Cookie verification fallback
  const csrfCookie = req.cookies._csrf;
  const csrfHeader = req.headers['x-xsrf-token'] || req.headers['x-csrf-token'];
  
  if (csrfCookie && csrfHeader && csrfCookie === csrfHeader) {
    return next();
  }

  return res.status(403).json({ success: false, message: 'Invalid CSRF token or origin' });
};

export { csrfProtection };
