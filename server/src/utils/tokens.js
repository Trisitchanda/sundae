import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const generateAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export { generateAccessToken, generateRefreshToken, hashToken };
